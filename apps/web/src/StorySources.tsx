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
  // Preserve the primary outlet first, then deduplicate grouped outlet names.
  const outlets = new Map<string, { name: string; url: string }>();
  for (const article of [story, ...(story.coverage ?? [])]) {
    for (const name of article.sources) {
      const key = name.trim().toLocaleLowerCase();
      if (key && !outlets.has(key)) {
        // Grouped story.sources is a union; coverage retains each outlet's URL.
        const report = story.coverage?.find((item) =>
          item.sources.some(
            (source) => source.trim().toLocaleLowerCase() === key,
          ),
        );
        outlets.set(key, { name, url: report?.url ?? article.url });
      }
    }
  }
  const sources = [...outlets.values()];
  const articles = story.coverage ?? [];
  return (
    <div className="story-sources flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-[var(--secondary)]">
      {sources.slice(0, 2).map((source) => (
        <SourceLink key={source.name} {...source} />
      ))}
      {sources.length > 0 && <span aria-hidden="true">·</span>}
      {children}
      {articles.length > 1 && (
        <details className="coverage w-full text-xs">
          <summary className="cursor-pointer text-xs">
            {sources.length > 2
              ? `+${sources.length - 2} more ${sources.length === 3 ? 'outlet' : 'outlets'}`
              : `${articles.length} articles`}
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
                  {article.sources.map((name) => (
                    <SourceLink key={name} name={name} url={article.url} />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
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
      <span className="text-xs break-words">{name}</span>
    </a>
  );
}
