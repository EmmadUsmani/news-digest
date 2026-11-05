import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

import { AdminOverview } from './AdminOverview';
import { ThemeToggle } from './components/theme-toggle';
import { DigestPreview } from './DigestPreview';
import { contentQuery, healthQuery, topicsQuery } from './queries';
import { StatusPanel } from './StatusPanel';
export function App({ admin = false }: { admin?: boolean }) {
  return admin ? (
    <AdminApp />
  ) : (
    <main>
      <header>
        <a href="/" aria-label="News Digest home">
          <h1 className="m-0 font-sans text-2xl font-semibold">News Digest</h1>
        </a>
        <ThemeToggle />
      </header>
      <p>
        <Link to="/editions" search={{ page: 1 }}>
          Past editions →
        </Link>
      </p>
      <DigestPreview />
    </main>
  );
}

function AdminApp() {
  const [showControls, setShowControls] = useState(false);
  return (
    <div>
      <AdminOverview />
      <details
        className="mt-6"
        onToggle={(event) => setShowControls(event.currentTarget.open)}
      >
        <summary>Edition and management controls</summary>
        {showControls && <LegacyAdminControls />}
      </details>
    </div>
  );
}

function LegacyAdminControls() {
  const { data: content = [], isError: contentError } = useQuery(contentQuery);
  const { data: topics = [], isError: topicsError } = useQuery(topicsQuery);
  const { data: health, isError: healthError } = useQuery(healthQuery);
  const settingsError = topicsError;
  return (
    <div>
      <section>
        <section className="topics" aria-label="Your topics">
          <p className="eyebrow">YOUR NEWS DESK</p>
          <h2>Incoming from your sources.</h2>
          {settingsError ? (
            <p role="alert">
              Topic settings could not be loaded. Please try again.
            </p>
          ) : (
            <>
              <p>
                <Link to="/admin/topics">Manage topics and sources</Link>
              </p>
              <div className="topic-grid">
                {topics
                  .filter((t) => t.enabled)
                  .map((t) => (
                    <article key={t.id}>
                      <h3>{t.name}</h3>
                      <p>{t.description}</p>
                      <small>
                        Digest budget: {t.storyBudget} stories · {t.postBudget}{' '}
                        posts
                      </small>
                      <ul className="headlines">
                        {content
                          .find((group) => group.topicId === t.id)
                          ?.items.map((item) => (
                            <li key={item.id}>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {item.title}
                              </a>
                              <span>
                                {item.source} ·{' '}
                                <time dateTime={item.publishedAt}>
                                  {new Date(item.publishedAt).toLocaleString(
                                    undefined,
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    },
                                  )}
                                </time>
                              </span>
                            </li>
                          ))}
                      </ul>
                      {contentError ? (
                        <p role="alert">Recent articles could not be loaded.</p>
                      ) : (
                        !content.find((group) => group.topicId === t.id)?.items
                          .length && (
                          <p>
                            {t.sources.length
                              ? 'Waiting for source collection.'
                              : 'No sources connected yet. Open Topics to connect sources.'}
                          </p>
                        )
                      )}
                    </article>
                  ))}
              </div>
            </>
          )}
        </section>
        <StatusPanel />
        <aside aria-live="polite">
          <span
            className={
              !healthError && health?.status === 'ok' ? 'dot good' : 'dot'
            }
          />
          {healthError
            ? 'System needs attention'
            : health
              ? health.status === 'ok'
                ? 'System online · Database and queue connected'
                : 'System needs attention'
              : 'Checking system status…'}
        </aside>
      </section>
    </div>
  );
}
