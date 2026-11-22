import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useSearch } from '@tanstack/react-router';
import { type ReactNode, type Ref, useEffect, useRef } from 'react';

import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { HttpError, weeklyEditionQuery, weeklyHistoryQuery } from './queries';
import { ReaderSkipLink } from './ReaderSkipLink';

const linkStyle =
  'inline-flex min-h-[44px] items-center rounded-md text-sm font-medium text-[var(--accent)] underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';
const date = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
function WeeklyPage({
  children,
  headingRef,
  page,
  title = 'Week in review',
}: {
  children: ReactNode;
  headingRef?: Ref<HTMLHeadingElement>;
  page?: number;
  title?: string;
}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title}${page ? ` · Page ${page}` : ''} | News Digest`;
    return () => {
      document.title = previousTitle;
    };
  }, [title, page]);
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-[20px] pb-16 [overflow-wrap:anywhere] sm:px-[24px]">
      <ReaderSkipLink target="weekly-content" />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] py-5">
        <Link to="/" className={linkStyle}>
          News Digest
        </Link>
        <Link to="/editions" search={{ page: 1 }} className={linkStyle}>
          Past editions
        </Link>
        <ThemeToggle />
      </header>
      <div className="pt-12">
        <h1
          ref={headingRef}
          aria-description={page ? `Page ${page}` : undefined}
          id="weekly-content"
          tabIndex={-1}
          className="m-0 scroll-mt-6 font-sans text-3xl leading-tight font-semibold tracking-tight"
        >
          {title}
        </h1>
        {children}
      </div>
    </main>
  );
}
function ReadError({
  retry,
  missing = false,
}: {
  retry: () => void;
  missing?: boolean;
}) {
  return (
    <div role="alert" className="my-8">
      <p>
        {missing
          ? 'This weekly edition could not be found.'
          : 'Could not load the week in review.'}
      </p>
      {!missing && <Button onClick={retry}>Try again</Button>}
      <Link to="/weekly-editions" search={{ page: 1 }} className={linkStyle}>
        All weekly editions
      </Link>
    </div>
  );
}
export function WeeklyArchive() {
  const { page } = useSearch({ from: '/weekly-editions' });
  const history = useQuery(weeklyHistoryQuery((page - 1) * 20));
  const heading = useRef<HTMLHeadingElement>(null);
  const previousPage = useRef(page);
  useEffect(() => {
    if (previousPage.current === page || history.isPending) return;
    previousPage.current = page;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [page, history.isPending]);
  return (
    <WeeklyPage headingRef={heading} page={page}>
      <p className="text-[var(--secondary)]">
        The week’s biggest stories, with links to daily coverage.
      </p>
      {history.isPending && <p role="status">Loading weekly editions…</p>}
      {history.isError && (
        <ReadError
          retry={() => {
            void history.refetch();
          }}
        />
      )}
      {history.data && (
        <>
          {!history.data.entries.length && (
            <p className="my-8">
              {page === 1
                ? 'No weekly editions have been published yet.'
                : 'No weekly editions on this page.'}
            </p>
          )}
          <ul className="my-8 list-none divide-y divide-[var(--border)] p-0">
            {history.data.entries.map((entry) => (
              <li key={entry.id} className="py-5">
                <Link
                  to="/weekly-editions/$id"
                  params={{ id: entry.id }}
                  className={linkStyle}
                >
                  Week in review · {date(entry.windowEnd)}
                </Link>
                <p className="text-sm text-[var(--secondary)]">
                  Coverage: {date(entry.windowStart)} – {date(entry.windowEnd)}{' '}
                  (UTC)
                </p>
                <p className="text-sm text-[var(--secondary)]">
                  {entry.topics.map((topic) => topic.name).join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
      <nav
        aria-label="Weekly edition pages"
        className="flex flex-wrap items-center justify-between gap-3 text-sm"
      >
        {page > 1 && (
          <Link
            to="/weekly-editions"
            search={{ page: page - 1 }}
            className={linkStyle}
          >
            ← Newer weeks
          </Link>
        )}
        <span>Page {page}</span>
        {history.data?.nextOffset != null && (
          <Link
            to="/weekly-editions"
            search={{ page: history.data.nextOffset / 20 + 1 }}
            className={linkStyle}
          >
            Older weeks →
          </Link>
        )}
      </nav>
    </WeeklyPage>
  );
}
export function WeeklyEdition() {
  const { id } = useParams({ from: '/weekly-editions/$id' });
  const edition = useQuery(weeklyEditionQuery(id));
  return (
    <WeeklyPage
      title={
        edition.data
          ? `Week in review · ${date(edition.data.windowEnd)}`
          : 'Week in review'
      }
    >
      <Link to="/weekly-editions" search={{ page: 1 }} className={linkStyle}>
        ← All weekly editions
      </Link>
      {edition.isPending && <p role="status">Loading weekly edition…</p>}
      {edition.isError && (
        <ReadError
          retry={() => {
            void edition.refetch();
          }}
          missing={
            edition.error instanceof HttpError && edition.error.status === 404
          }
        />
      )}
      {edition.data && (
        <>
          <p className="text-[var(--secondary)]">
            Coverage: {date(edition.data.windowStart)} –{' '}
            {date(edition.data.windowEnd)} (UTC)
          </p>
          <nav aria-label="Topics in this week’s review" className="my-6">
            <ul className="flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
              {edition.data.topics.map((topic) => (
                <li key={topic.id}>
                  <a href={`#weekly-topic-${topic.id}`} className={linkStyle}>
                    {topic.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {edition.data.topics.map((topic) => (
            <section
              key={topic.id}
              aria-labelledby={`weekly-topic-${topic.id}`}
              className="border-t border-[var(--border)] py-8"
            >
              <h2
                id={`weekly-topic-${topic.id}`}
                tabIndex={-1}
                className="scroll-mt-6 font-sans text-2xl leading-tight font-semibold"
              >
                {topic.name}
              </h2>
              {!topic.stories.length && (
                <p className="text-[var(--secondary)]">
                  No stories in this week’s review.
                </p>
              )}
              {topic.stories.map((story, index) => (
                <article key={index} className="my-8">
                  <h3 className="text-xl font-semibold">{story.title}</h3>
                  <p className="whitespace-pre-line leading-7">
                    {story.summary}
                  </p>
                  <h4 className="mt-4 text-sm font-semibold">Daily coverage</h4>
                  <ul className="list-none p-0">
                    {story.coverage.map((coverage, coverageIndex) => (
                      <li key={coverageIndex}>
                        <Link
                          to="/editions/$id"
                          params={{ id: coverage.editionId }}
                          hash={
                            coverage.kind === 'story'
                              ? `story-${coverage.itemId}`
                              : `posts-${topic.id}`
                          }
                          className={linkStyle}
                        >
                          {date(coverage.publishedAt)} · {coverage.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>
          ))}
        </>
      )}
    </WeeklyPage>
  );
}
