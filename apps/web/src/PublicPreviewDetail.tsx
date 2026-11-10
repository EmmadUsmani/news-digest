import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';

import { Button } from './components/ui/button';
import { publicPreviewDetailQuery } from './queries';

export function PublicPreviewDetail() {
  const { id } = useParams({ from: '/admin/editions/$id' });
  const result = useQuery(publicPreviewDetailQuery(id));
  return (
    <section aria-label="Published edition" className="grid gap-5">
      <Button
        disabled={result.isFetching}
        onClick={() => void result.refetch()}
      >
        Refresh edition
      </Button>
      {result.isPending && <p role="status">Loading edition…</p>}
      {result.isError && (
        <p role="alert">Published edition unavailable. Try refreshing.</p>
      )}
      {result.data && !result.isError && (
        <>
          <p>
            Coverage: {new Date(result.data.windowStart).toLocaleString()}
            {' – '}
            {new Date(result.data.windowEnd).toLocaleString()}
          </p>
          <Link
            to="/editions/$id"
            params={{ id }}
            className="text-[var(--accent)] underline"
          >
            Read published edition
          </Link>
          {result.data.topics.map((topic) => (
            <article key={topic.id}>
              <h2>{topic.name}</h2>
              <ul>
                {topic.brief.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
              <p>
                {topic.stories.length} stories · {topic.posts.length} posts
              </p>
            </article>
          ))}
          {!result.data.topics.length && <p>No topics in this edition.</p>}
        </>
      )}
    </section>
  );
}
