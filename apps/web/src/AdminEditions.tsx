import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { useState } from 'react';

import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Table } from './components/ui/table';
import { adminEditionDetailQuery, adminHistoryQuery } from './queries';

const date = (value: string) => new Date(value).toLocaleString();

export function AdminEditions() {
  const [offset, setOffset] = useState(0);
  const result = useQuery(adminHistoryQuery(offset));
  return (
    <section
      aria-label="Saved editions"
      className="grid max-w-none gap-5 p-0 [&_a]:text-sm [&_a]:font-medium [&_h4_a]:text-base"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-sm text-[var(--secondary)]">
          Review saved editions and their selection evidence.
        </p>
        <Button asChild>
          <Link to="/admin/editions/new">New edition</Link>
        </Button>
        <Button
          variant="ghost"
          disabled={result.isFetching}
          onClick={() => void result.refetch()}
        >
          Refresh editions
        </Button>
      </div>
      {result.isPending && <p role="status">Loading editions…</p>}
      {result.isError && (
        <p role="alert">
          Editions could not be refreshed. Previously loaded rows may be out of
          date.
        </p>
      )}
      {result.data && (
        <Card className="min-w-0">
          <Table className="min-w-[640px] [&_td]:whitespace-nowrap">
            <thead>
              <tr>
                <th>Saved</th>
                <th>Coverage window</th>
                <th>Selection method</th>
              </tr>
            </thead>
            <tbody>
              {result.data.entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <Link
                      to="/admin/editions/$id"
                      params={{ id: entry.id }}
                      className="font-medium underline underline-offset-4"
                    >
                      {date(entry.createdAt)}
                    </Link>
                    <span className="mt-1 block text-xs text-[var(--secondary)]">
                      {entry.id.slice(0, 8)}
                    </span>
                  </td>
                  <td>
                    <time dateTime={entry.windowStart}>
                      {date(entry.windowStart)}
                    </time>
                    <span className="block">to {date(entry.windowEnd)}</span>
                  </td>
                  <td>{entry.method}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {!result.data.entries.length && (
            <p>No saved editions on this page.</p>
          )}
        </Card>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          disabled={!offset || result.isFetching}
          onClick={() => setOffset((value) => Math.max(0, value - 20))}
        >
          Newer editions
        </Button>
        <span className="text-sm">Page {offset / 20 + 1}</span>
        <Button
          variant="ghost"
          disabled={
            !result.data?.hasMore || result.isFetching || result.isError
          }
          onClick={() => setOffset((value) => value + 20)}
        >
          Older editions
        </Button>
      </div>
    </section>
  );
}

export function AdminEditionInspector() {
  const { id } = useParams({ from: '/admin/editions/$id' });
  const result = useQuery(adminEditionDetailQuery(id));
  const [selected, setSelected] = useState<string | null>(null);
  const edition = result.data;
  const topic =
    edition?.topics.find((item) => item.id === selected) ?? edition?.topics[0];
  return (
    <section
      aria-label="Edition inspector"
      className="grid max-w-none gap-5 p-0 [&_a]:text-sm [&_a]:font-medium [&_h4_a]:text-base"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost">
          <Link to="/admin/editions">All editions</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/editions/$id" params={{ id }}>
            View as reader
          </Link>
        </Button>
      </div>
      {result.isPending && <p role="status">Loading edition…</p>}
      {result.isError && (
        <p role="alert">
          This edition could not be loaded.{' '}
          <Button variant="ghost" onClick={() => void result.refetch()}>
            Retry edition
          </Button>
        </p>
      )}
      {edition && (
        <>
          <Card>
            <h2 className="mt-0 font-sans text-lg font-semibold">
              Saved {date(edition.createdAt)}
            </h2>
            <p className="mb-0 text-sm text-[var(--secondary)]">
              {date(edition.windowStart)} to {date(edition.windowEnd)} ·{' '}
              {edition.method}
            </p>
          </Card>
          <div
            role="tablist"
            aria-label="Edition topics"
            onKeyDown={(event) => {
              const buttons = Array.from(
                event.currentTarget.querySelectorAll<HTMLButtonElement>(
                  '[role="tab"]',
                ),
              );
              const index = buttons.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              const next =
                event.key === 'ArrowRight'
                  ? (index + 1) % buttons.length
                  : event.key === 'ArrowLeft'
                    ? (index - 1 + buttons.length) % buttons.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? buttons.length - 1
                        : -1;
              if (next >= 0) {
                event.preventDefault();
                buttons[next]?.focus();
                buttons[next]?.click();
              }
            }}
            className="flex flex-wrap gap-2"
          >
            {edition.topics.map((item) => (
              <Button
                key={item.id}
                role="tab"
                tabIndex={topic?.id === item.id ? 0 : -1}
                aria-selected={topic?.id === item.id}
                aria-controls="edition-topic"
                id={`tab-${item.id}`}
                variant={topic?.id === item.id ? 'default' : 'ghost'}
                onClick={() => setSelected(item.id)}
              >
                {item.name}
              </Button>
            ))}
          </div>
          {topic && (
            <div
              key={topic.id}
              role="tabpanel"
              id="edition-topic"
              aria-labelledby={`tab-${topic.id}`}
              className="grid min-w-0 gap-5"
            >
              <Card>
                <h2 className="mt-0 font-sans text-lg font-semibold">
                  {topic.name}
                </h2>
                <p className="text-sm">
                  {topic.candidateCount} article candidates ·{' '}
                  {topic.relevanceRejectedCount ?? 'Unknown'} relevance
                  rejections · {topic.qualityRejections?.length ?? 'Unknown'}{' '}
                  quality rejections
                </p>
                <p className="text-sm">
                  Stories: {topic.editorial?.mode ?? 'non-ai'} · Posts:{' '}
                  {topic.postEditorial?.mode ?? 'not recorded'}
                </p>
                <p className="text-sm text-[var(--secondary)]">
                  {topic.editorial?.reason}
                </p>
                {topic.editorial?.brief.map((text, index) => (
                  <p key={index}>{text}</p>
                ))}
              </Card>
              <h3 className="m-0 font-sans text-base font-semibold">
                Stories ({topic.stories.length})
              </h3>
              {topic.stories.map((story) => (
                <Card key={story.id} className="min-w-0 break-words">
                  <h4 className="mt-0 font-sans text-base font-semibold">
                    <a href={story.url} target="_blank" rel="noreferrer">
                      {story.title}
                    </a>
                  </h4>
                  <p className="text-sm">
                    Score {story.score} · {story.sources.join(', ')}
                  </p>
                  <p>{story.summary ?? story.excerpt}</p>
                  {story.whyItMatters && (
                    <p>
                      <strong>Why it matters: </strong>
                      {story.whyItMatters}
                    </p>
                  )}
                  <ul className="text-sm">
                    {story.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                  {!!story.coverage?.length && (
                    <>
                      <h5 className="mb-2 text-sm">Grouping members</h5>
                      <ul className="text-sm">
                        {story.coverage.map((member) => (
                          <li key={member.id}>
                            <a
                              href={member.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {member.title}
                            </a>{' '}
                            · {member.sources.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {!!story.evidence?.length && (
                    <details>
                      <summary className="text-sm">
                        Source evidence ({story.evidence.length})
                      </summary>
                      {story.evidence.map((item) => (
                        <div key={item.id}>
                          <p>
                            <a href={item.url} target="_blank" rel="noreferrer">
                              {item.title}
                            </a>
                          </p>
                          <p className="text-sm">{item.excerpt}</p>
                        </div>
                      ))}
                    </details>
                  )}
                </Card>
              ))}
              <h3 className="m-0 font-sans text-base font-semibold">
                Posts ({topic.posts?.length ?? 0})
              </h3>
              {topic.postEditorial?.reason && (
                <p className="m-0 text-sm">{topic.postEditorial.reason}</p>
              )}
              {topic.posts?.map((post) => (
                <Card
                  key={`${post.platform}:${post.externalId}`}
                  className="min-w-0 break-words"
                >
                  <h4 className="mt-0 font-sans text-base">
                    <a href={post.url} target="_blank" rel="noreferrer">
                      {post.author} · {post.platform}
                    </a>
                  </h4>
                  <p className="whitespace-pre-wrap">
                    {post.displayText ?? post.text}
                  </p>
                  {post.whyItMatters && <p>{post.whyItMatters}</p>}
                  <ul className="text-sm">
                    {post.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
