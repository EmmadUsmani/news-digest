import './style.css';

import type {
  ContentGroup,
  Health,
  ProfileSettings,
  Topic,
} from '@digest/contracts';
import {
  contentGroupSchema,
  profileSettingsSchema,
  topicSchema,
} from '@digest/contracts';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { installBrowserErrors } from './browser-errors';
import { DigestPreview } from './DigestPreview';
import { ScheduleSettings } from './ScheduleSettings';
import { StatusPanel } from './StatusPanel';
import { TopicSettings } from './TopicSettings';
export function App() {
  const [content, setContent] = React.useState<ContentGroup[]>([]);
  const [contentError, setContentError] = React.useState(false);
  React.useEffect(() => {
    fetch('/api/content')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setContent(contentGroupSchema.array().parse(data)))
      .catch(() => setContentError(true));
  }, []);
  const [topics, setTopics] = React.useState<Topic[]>([]);
  const [profile, setProfile] = React.useState<ProfileSettings | null>(null);
  const [settingsError, setSettingsError] = React.useState(false);
  React.useEffect(() => {
    Promise.all([
      fetch('/api/topics')
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then((data) => topicSchema.array().parse(data)),
      fetch('/api/profile')
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then((data) => profileSettingsSchema.parse(data)),
    ])
      .then(([topics, profile]) => {
        setTopics(topics);
        setProfile(profile);
      })
      .catch(() => setSettingsError(true));
  }, []);
  const [health, setHealth] = React.useState<Health | null>(null);
  React.useEffect(() => {
    fetch('/healthz')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() =>
        setHealth({ status: 'degraded', database: false, redis: false }),
      );
  }, []);
  return (
    <main>
      <header>
        <a href="/" aria-label="News Digest home">
          ND<span> / News Digest</span>
        </a>
        <span className="edition">YOUR DAILY PERSPECTIVE</span>
      </header>
      <section>
        <p className="eyebrow">LESS SCROLLING. MORE CONTEXT.</p>
        <h1>
          Make time for
          <br />
          what matters.
        </h1>
        <p className="intro">
          Your important stories, brought together in one thoughtful digest.
        </p>
        <DigestPreview />
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
                onReordered={setTopics}
                onSaved={(saved) => {
                  setTopics((current) =>
                    current.some((topic) => topic.id === saved.id)
                      ? current.map((topic) =>
                          topic.id === saved.id ? saved : topic,
                        )
                      : [...current, saved],
                  );
                  fetch('/api/content')
                    .then((r) => {
                      if (!r.ok) throw new Error();
                      return r.json();
                    })
                    .then((data) => {
                      setContent(contentGroupSchema.array().parse(data));
                      setContentError(false);
                    })
                    .catch(() => setContentError(true));
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
                <ScheduleSettings profile={profile} onSaved={setProfile} />
              )}
            </>
          )}
        </section>
        <StatusPanel />
        <aside aria-live="polite">
          <span className={health?.status === 'ok' ? 'dot good' : 'dot'} />
          {health
            ? health.status === 'ok'
              ? 'System online · Database and queue connected'
              : 'System needs attention'
            : 'Checking system status…'}
        </aside>
      </section>
      <footer>A little less noise. A clearer view.</footer>
    </main>
  );
}
installBrowserErrors();
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
