import { ServiceUnavailableException } from '@nestjs/common';

import { prepareDevelopmentXRuntime } from './development-x-runtime';
import { SharedHttpClient } from './libs/ports/http.client';
import type { DevelopmentPostSelection } from './modules/digests/database/preview.repository';
import { XOfficialEmbed } from './modules/social/adapters/x-oembed';
import type { PostVerificationPort } from './modules/social/domain/posts';
import type { FixedSearchSettings } from './modules/social/domain/x-search.port';
import { developmentEditionX } from './modules/social/public/development-edition';

/** Explicit private-edition composition; no production discovery writes. */
export function developmentXSelection(
  runtime: ReturnType<typeof prepareDevelopmentXRuntime>,
  editionId: string,
  settings: (topicId: string) => Promise<FixedSearchSettings | null>,
  embeds: PostVerificationPort = new XOfficialEmbed(new SharedHttpClient()),
): DevelopmentPostSelection {
  if (!runtime)
    throw new ServiceUnavailableException('Development X search is disabled');
  const edition = developmentEditionX(runtime, embeds, editionId);
  return async (input) => {
    if (!Number.isInteger(input.budget) || input.budget <= 0)
      return { posts: [], candidates: [] };
    const configuration = await settings(input.topicId);
    // Topics without an explicit keyword recipe never spend development funds.
    if (!configuration) return { posts: [], candidates: [] };
    return edition.candidates(
      input.topicId,
      {
        topic: input.name,
        guidance: input.guidance,
        fromDate: '',
        toDate: '',
        fixedSearch: {
          style: 'trending',
          settings: configuration,
          rankedStoryTitles: [],
        },
      },
      input.policy,
      input.start,
      input.end,
      input.budget,
    );
  };
}
