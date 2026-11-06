import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';

import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { EditionDateSwitcher } from './EditionDateSwitcher';
import { editionQuery, HttpError } from './queries';
import { ReaderContents } from './ReaderContents';
import { StorySources } from './StorySources';
import { TopPosts } from './TopPosts';

export function DigestPreview() {
  const { id } = useParams({ strict: false });
  const edition = useQuery(editionQuery(id));
  const preview = edition.data;
  return (
    <main className="mx-auto min-h-screen max-w-[1008px] px-4 pb-16 sm:px-6">
      <header className="sticky top-0 z-30 flex h-[65px] items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--background)] py-0">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          News Digest
        </Link>
        <div className="flex items-center gap-2">
          <EditionDateSwitcher edition={preview} />
          <ThemeToggle />
        </div>
      </header>
      {edition.isPending && (
        <p role="status" className="pt-16">
          Loading edition…
        </p>
      )}
      {edition.isError && (
        <div role="alert" className="pt-16">
          {edition.error instanceof HttpError &&
          edition.error.status === 404 ? (
            <>
              <h1 className="font-sans text-2xl tracking-tight">
                Edition not found
              </h1>
              <Link to="/" className="text-sm text-[var(--accent)]">
                Back to latest edition
              </Link>
            </>
          ) : (
            <>
              <p>Could not load the edition.</p>
              <Button onClick={() => void edition.refetch()}>Try again</Button>
            </>
          )}
        </div>
      )}
      {!preview && !edition.isPending && !edition.isError && (
        <p className="pt-16 text-sm text-[var(--secondary)]">No edition yet.</p>
      )}
      {preview && (
        <div className="flex gap-6 pt-20 lg:pt-10">
          <ReaderContents topics={preview.topics} />
          <div className="min-w-0 max-w-2xl flex-1 space-y-16">
            {preview.topics.map((topic) => (
              <article className="digest-topic m-0 border-0 p-0" key={topic.id}>
                <h2
                  id={`topic-${topic.id}`}
                  className="m-0 scroll-mt-36 font-sans text-2xl leading-tight font-semibold tracking-tight lg:scroll-mt-24"
                >
                  {topic.name}
                </h2>
                {topic.brief.length > 0 && (
                  <ul className="topic-brief my-6 space-y-2 pl-5 text-base leading-7">
                    {topic.brief.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
                {topic.stories.length === 0 && (
                  <p className="my-6 text-sm text-[var(--secondary)]">
                    Quiet day for this topic.
                  </p>
                )}
                <ol className="my-6 list-none space-y-4 pl-0">
                  {topic.stories.map((story) => (
                    <li key={story.id} className="border-0 p-0">
                      <Card
                        id={`story-${story.id}`}
                        className="scroll-mt-36 rounded-lg p-5 shadow-none lg:scroll-mt-24"
                      >
                        <h3 className="m-0 font-sans text-lg leading-7 font-semibold tracking-tight">
                          <a
                            href={story.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-lg leading-7 font-semibold hover:text-[var(--accent)]"
                          >
                            {story.title}
                          </a>
                        </h3>
                        {story.summary && (
                          <p className="excerpt my-3 text-base leading-7">
                            {story.summary}
                          </p>
                        )}
                        <StorySources story={story}>
                          <time dateTime={story.publishedAt}>
                            {relativeTime(story.publishedAt, preview.windowEnd)}
                          </time>
                        </StorySources>
                      </Card>
                    </li>
                  ))}
                </ol>
                <div
                  id={`posts-${topic.id}`}
                  className="scroll-mt-36 lg:scroll-mt-24"
                >
                  <TopPosts posts={topic.posts} />
                </div>
              </article>
            ))}
            <Link
              to="/editions"
              search={{ page: 1 }}
              className="block text-sm font-medium text-[var(--accent)]"
            >
              Past editions →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

function relativeTime(value: string, editionEnd: string) {
  const hours = Math.max(
    0,
    Math.floor((Date.parse(editionEnd) - Date.parse(value)) / 3_600_000),
  );
  return hours < 1
    ? 'Within the hour'
    : hours < 24
      ? `${hours}h before edition`
      : `${Math.floor(hours / 24)}d before edition`;
}
