import type { readerStorySchema } from '@digest/contracts';
import type { ReactNode } from 'react';
import type { z } from 'zod';

export function StorySources({
  story,
  children,
}: {
  story: z.infer<typeof readerStorySchema>;
  children: ReactNode;
}) {
  // Preserve the primary outlet first, then show each publisher once.
  const outlets = new Map<string, { name: string; url: string }>();
  const primary = story.coverage?.find((article) => article.url === story.url);
  for (const article of [primary ?? story, story, ...(story.coverage ?? [])]) {
    for (const name of article.sources) {
      const sourceName = name.trim().toLocaleLowerCase();
      if (!sourceName) continue;
      // Feed labels can name different sections of the same publisher.
      const report = story.coverage?.find((item) =>
        item.sources.some(
          (source) => source.trim().toLocaleLowerCase() === sourceName,
        ),
      );
      const url = report?.url ?? article.url;
      const publisher = new URL(url).hostname.replace(/^www\./, '');
      if (!outlets.has(publisher)) outlets.set(publisher, { name, url });
    }
  }
  const sources = [...outlets.values()];
  const articles = story.coverage ?? [];
  return (
    <div className="story-sources flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-[var(--secondary)]">
      {sources.slice(0, 2).map((source) => (
        <SourceLink key={source.name} {...source} />
      ))}
      {articles.length > 0 && (
        <details className="coverage order-2 max-w-full text-xs open:order-4 open:w-full">
          <summary
            className="cursor-pointer text-xs"
            title={`${articles.length} ${articles.length === 1 ? 'article' : 'articles'}`}
            aria-label={`Show ${articles.length} ${articles.length === 1 ? 'article' : 'articles'} covering this story`}
          >
            {sources.length > 2
              ? `+${sources.length - 2} ${sources.length === 3 ? 'outlet' : 'outlets'}`
              : `${articles.length} ${articles.length === 1 ? 'article' : 'articles'}`}
          </summary>
          <ul className="my-3 list-none space-y-3 pl-0">
            {articles.map((article) => (
              <li key={article.id} className="space-y-1">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm font-normal hover:text-[var(--accent)]"
                >
                  {article.title}
                </a>
                <span className="flex flex-wrap gap-x-3 gap-y-1">
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                  {/* Feed sections describe discovery, not extra publishers. */}
                  {article.sources.slice(0, 1).map((name) => (
                    <SourceLink key={name} name={name} url={article.url} />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
      <span className="order-3 inline-flex items-center gap-x-2">
        {sources.length > 0 && <span aria-hidden="true">·</span>}
        {children}
      </span>
    </div>
  );
}

function SourceLink({ name, url }: { name: string; url: string }) {
  const origin = new URL(url);
  const favicon = ['https:', 'http:'].includes(origin.protocol)
    ? `${origin.origin}/favicon.ico`
    : undefined;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center gap-1.5 text-xs font-normal hover:text-[var(--accent)]"
    >
      {favicon && (
        <img
          src={favicon}
          alt=""
          width={14}
          height={14}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-3.5 shrink-0 object-contain"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      )}
      <span className="text-xs break-words">
        {name === 'Hacker News' || name.startsWith('Google News:')
          ? `via ${name}`
          : name}
      </span>
    </a>
  );
}
