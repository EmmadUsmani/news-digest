import type { ServerResponse } from 'node:http';

import {
  type DigestPreview,
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import {
  BadRequestException,
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';

import { PreviewRepository } from './domain/preview.repository';

function completeExcerpt(excerpt: string) {
  if (!excerpt.endsWith('…')) return excerpt;
  const text = excerpt.slice(0, -1);
  let boundary = 0;
  for (const sentence of new Intl.Segmenter('en', {
    granularity: 'sentence',
  }).segment(text)) {
    const end = sentence.index + sentence.segment.trimEnd().length;
    if (/[.!?]["'”’)]*$/.test(sentence.segment.trimEnd())) boundary = end;
  }
  // Keep substantial reporting; a single long sentence still uses the saved
  // word-boundary excerpt. Preserve the ellipsis as the omission marker.
  return boundary >= text.length / 2 && boundary < text.length
    ? text.slice(0, boundary) + ' …'
    : excerpt;
}

function readerExcerpt(title: string, excerpt: string) {
  excerpt = completeExcerpt(excerpt);
  const marker = `The post ${title} appeared first on `;
  const start = excerpt.lastIndexOf(marker);
  if (start <= 0) return excerpt;
  const publisher = excerpt.slice(start + marker.length).trim();
  // Remove only a terminal WordPress credit matching this story's exact title.
  if (!/^[^.!?\n]{1,200}\s*\.$/.test(publisher)) return excerpt;
  return excerpt.slice(0, start).trimEnd() || excerpt;
}

type CoverageArticle = NonNullable<
  DigestPreview['topics'][number]['stories'][number]['coverage']
>[number];

function sameCoverageReport(left: CoverageArticle, right: CoverageArticle) {
  if (left.id === right.id) return true;
  // Google News can issue two wrapper IDs for the same outlet headline with
  // one-second feed timestamp jitter. Keep the first saved citation; do not
  // merge other publishers, later updates or merely similar headlines.
  return (
    !!left.publisher?.name &&
    left.publisher.name === right.publisher?.name &&
    left.title === right.title &&
    new URL(left.url).hostname === 'news.google.com' &&
    new URL(right.url).hostname === 'news.google.com' &&
    Math.abs(Date.parse(left.publishedAt) - Date.parse(right.publishedAt)) <=
      1_000
  );
}

export function readerEdition(snapshot: DigestPreview) {
  return readerEditionSchema.parse({
    ...snapshot,
    topics: snapshot.topics.map((topic) => ({
      ...topic,
      brief: topic.editorial?.mode === 'ai' ? topic.editorial.brief : [],
      stories: topic.stories.map((story) => ({
        ...story,
        summary: story.summary || readerExcerpt(story.title, story.excerpt),
        ...(!story.summary && story.excerpt
          ? { summaryKind: 'source-excerpt' as const }
          : {}),
        // Editors may cite a second ranked story outside the selected group.
        // Keep original metadata first, collapsing duplicate wrapper citations.
        coverage:
          story.coverage || story.evidence
            ? [
                ...(story.coverage ?? []),
                ...(story.evidence ?? []).map((article) => ({
                  ...article,
                  // Ranked evidence can aggregate discovery labels for several
                  // reports. Only the saved URL identifies this linked report.
                  sources:
                    article.sources.length > 1
                      ? [new URL(article.url).hostname.replace(/^www\./, '')]
                      : article.sources,
                })),
              ].filter(
                (article, index, articles) =>
                  articles.findIndex((other) =>
                    sameCoverageReport(other, article),
                  ) === index,
              )
            : undefined,
      })),
      posts: topic.posts ?? [],
    })),
  });
}

@Controller('api/editions')
export class ReaderEditionController {
  constructor(private readonly repository: PreviewRepository) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async history(@Query('offset') offset = '0') {
    if (!/^(0|[1-9]\d{0,6})$/.test(offset))
      throw new BadRequestException(
        'Use a nonnegative offset of at most 9999999',
      );
    const history = await this.repository.history(
      Number(offset),
      process.env.READER_PUBLISHED_ONLY === '1',
    );
    return readerEditionHistorySchema.parse({
      ...history,
      entries: history.entries.map((entry) => ({
        ...entry,
        topics: (entry.topicModes ?? []).map(({ id, name }) => ({ id, name })),
      })),
    });
  }

  @Get('latest')
  @Header('Cache-Control', 'no-store')
  async latest() {
    const snapshot = await this.repository.latest(
      process.env.READER_PUBLISHED_ONLY === '1',
    );
    return snapshot ? readerEdition(snapshot) : null;
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async find(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res({ passthrough: true }) response?: ServerResponse,
  ) {
    const snapshot = await this.repository.find(
      id,
      process.env.READER_PUBLISHED_ONLY === '1',
    );
    if (!snapshot) throw new NotFoundException('Edition not found');
    const edition = readerEdition(snapshot);
    // Only immutable published IDs in the promoted public runtime may be
    // reused. Keep caches browser-private, including on the private VM proxy.
    // Set this after lookup and projection so errors retain no-store.
    if (
      process.env.PUBLIC_MODE === '1' &&
      process.env.READER_PUBLISHED_ONLY === '1'
    )
      response?.setHeader('Cache-Control', 'private, max-age=3600, immutable');
    return edition;
  }
}
