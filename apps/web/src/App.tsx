import { useQuery, useQueryClient } from '@tanstack/react-query';

import { ThemeToggle } from './components/theme-toggle';
import { DigestPreview } from './DigestPreview';
import {
  contentQuery,
  healthQuery,
  profileQuery,
  topicsQuery,
} from './queries';
import { ScheduleSettings } from './ScheduleSettings';
import { StatusPanel } from './StatusPanel';
import { TopicSettings } from './TopicSettings';
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
      <DigestPreview />
    </main>
  );
}

function AdminApp() {
  const queryClient = useQueryClient();
  const { data: content = [], isError: contentError } = useQuery(contentQuery);
  const { data: topics = [], isError: topicsError } = useQuery(topicsQuery);
  const { data: profile, isError: profileError } = useQuery(profileQuery);
  const { data: health, isError: healthError } = useQuery(healthQuery);
  const settingsError = topicsError || profileError;
  return (
    <div>
      <section>
        <DigestPreview admin />
        <section className="topics" aria-label="Your topics">
          <p className="eyebrow">YOUR NEWS DESK</p>
          <h2>Incoming from your sources.</h2>
          {settingsError ? (
            <p role="alert">
              Topic settings could not be loaded. Please try again.
            </p>
          ) : (
            <>
              <TopicSettings
                defaults={profile?.schedule}
                topics={topics}
                onReordered={(saved) => {
                  queryClient.setQueryData(topicsQuery.queryKey, saved);
                  void queryClient.invalidateQueries({
                    queryKey: contentQuery.queryKey,
                  });
                }}
                onSaved={(saved) => {
                  queryClient.setQueryData(
                    topicsQuery.queryKey,
                    (current = []) =>
                      current.some((topic) => topic.id === saved.id)
                        ? current.map((topic) =>
                            topic.id === saved.id ? saved : topic,
                          )
                        : [...current, saved],
                  );
                  void queryClient.invalidateQueries({
                    queryKey: contentQuery.queryKey,
                  });
                }}
              />
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
                              : 'No sources connected yet. Choose Sources in Manage topics.'}
                          </p>
                        )
                      )}
                    </article>
                  ))}
              </div>
              {profile && (
                <ScheduleSettings
                  profile={profile}
                  onSaved={(saved) =>
                    queryClient.setQueryData(profileQuery.queryKey, saved)
                  }
                />
              )}
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
