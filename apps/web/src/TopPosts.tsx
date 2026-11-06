import type { ReaderEdition } from '@digest/contracts';
import React from 'react';

type ReaderPost = ReaderEdition['topics'][number]['posts'][number];
type SelectedPost = Extract<ReaderPost, { platform: 'x' }>;
type SelectedRedditPost = Extract<ReaderPost, { platform: 'reddit' }>;
type SelectedBlueskyPost = Extract<ReaderPost, { platform: 'bluesky' }>;

type Widgets = {
  widgets: {
    createTweet: (
      id: string,
      target: HTMLElement,
      options: {
        dnt: boolean;
        conversation: string;
        width: number;
        theme: 'light' | 'dark';
      },
    ) => Promise<HTMLElement | undefined>;
  };
};
let widgetScript: Promise<Widgets> | undefined;
let widgetScriptFailed = false;
function loadWidgets(retry: boolean): Promise<Widgets> {
  const loaded = (window as Window & { twttr?: Widgets }).twttr;
  if (typeof loaded?.widgets?.createTweet === 'function')
    return Promise.resolve(loaded);
  if (retry && widgetScriptFailed) {
    widgetScript = undefined;
    widgetScriptFailed = false;
  }
  widgetScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    let settled = false;
    const cleanup = () => {
      settled = true;
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
    };
    const fail = () => {
      if (settled) return;
      cleanup();
      widgetScriptFailed = true;
      script.remove();
      reject(new Error('Embed unavailable'));
    };
    const timeout = window.setTimeout(fail, 15000);
    script.onload = () => {
      if (settled) return;
      const api = (window as Window & { twttr?: Widgets }).twttr;
      if (typeof api?.widgets?.createTweet === 'function') {
        cleanup();
        resolve(api);
      } else fail();
    };
    script.onerror = fail;
    document.head.append(script);
  });
  return widgetScript;
}

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}
function currentTheme(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function TopPosts({ posts }: { posts: ReaderPost[] }) {
  const theme = React.useSyncExternalStore(subscribeTheme, currentTheme);
  return (
    <section className="top-posts max-w-none p-0" aria-label="Top posts">
      <h4>Posts</h4>
      {posts.length === 0 ? (
        <p className="text-sm text-[var(--secondary)]">
          No standout posts today.
        </p>
      ) : (
        <div className="post-grid grid grid-cols-1 gap-4">
          {posts.map((post) =>
            post.platform === 'bluesky' ? (
              <BlueskyPost key={`bluesky:${post.externalId}`} post={post} />
            ) : post.platform === 'reddit' ? (
              <RedditPost key={`reddit:${post.externalId}`} post={post} />
            ) : (
              <Post key={`x:${post.externalId}`} post={post} theme={theme} />
            ),
          )}
        </div>
      )}
    </section>
  );
}

function PostContext({ post }: { post: ReaderPost }) {
  return post.whyItMatters?.trim() ? (
    <p className="post-context text-sm text-[var(--secondary)]">
      <span className="block text-xs font-semibold">Digest context</span>
      <span className="post-context-text">{post.whyItMatters}</span>
    </p>
  ) : null;
}

function Post({
  post,
  theme,
}: {
  post: SelectedPost;
  theme: 'light' | 'dark';
}) {
  const host = React.useRef<HTMLDivElement>(null);
  const [embedded, setEmbedded] = React.useState(false);
  const [savedTextOpen, setSavedTextOpen] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  React.useEffect(() => {
    const target = host.current;
    if (!target) return;
    let active = true;
    let widgetTimeout: number | undefined;
    const attemptTarget = document.createElement('div');
    target.replaceChildren(attemptTarget);
    setEmbedded(false);
    setFailed(false);
    setLoading(false);
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setLoading(true);
        void loadWidgets(attempt > 0)
          .then((api) => {
            if (!active) return undefined;
            widgetTimeout = window.setTimeout(() => {
              active = false;
              attemptTarget.remove();
              setLoading(false);
              setFailed(true);
            }, 15000);
            return api.widgets.createTweet(post.externalId, attemptTarget, {
              dnt: true,
              conversation: 'none',
              width: Math.min(550, Math.max(250, target.clientWidth)),
              theme,
            });
          })
          .then((element) => {
            window.clearTimeout(widgetTimeout);
            if (!active) return;
            setLoading(false);
            if (element) setEmbedded(true);
            else {
              attemptTarget.remove();
              setFailed(true);
            }
          })
          .catch(() => {
            window.clearTimeout(widgetTimeout);
            if (active) {
              setLoading(false);
              attemptTarget.remove();
              setFailed(true);
            }
          });
      },
      { rootMargin: '200px' },
    );
    observer.observe(target);
    return () => {
      active = false;
      window.clearTimeout(widgetTimeout);
      observer.disconnect();
      target.replaceChildren();
    };
  }, [post.externalId, attempt, theme]);
  return (
    <article className="post-card">
      <p className="byline">
        X ·{' '}
        <a
          href={post.authorUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-normal hover:text-[var(--accent)]"
        >
          {post.author}
        </a>{' '}
        ·{' '}
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </time>
      </p>
      {embedded ? (
        <details
          className="saved-post-text"
          open={savedTextOpen}
          onToggle={(event) => setSavedTextOpen(event.currentTarget.open)}
        >
          <summary>Saved post text</summary>
          <p className="post-text">
            <a href={post.url} target="_blank" rel="noreferrer">
              {post.displayText ?? post.text}
              <span className="sr-only">{` — View post by ${post.author} on X`}</span>
            </a>
          </p>
        </details>
      ) : (
        <p className="post-text">
          <a href={post.url} target="_blank" rel="noreferrer">
            {post.displayText ?? post.text}
            <span className="sr-only">{` — View post by ${post.author} on X`}</span>
          </a>
        </p>
      )}
      <div ref={host} className="official-post" />
      {loading && (
        <p role="status" className="m-0 text-xs text-[var(--secondary)]">
          Loading X media…
        </p>
      )}
      {failed && (
        <div className="x-media-error flex flex-wrap items-center gap-x-3 gap-y-1">
          <p role="status" className="m-0 text-xs text-[var(--secondary)]">
            X media could not load. Saved post text is shown above.
          </p>
          <button
            type="button"
            className="h-8 px-2 py-1 text-xs"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Retry X media
          </button>
        </div>
      )}
      {Object.keys(post.metrics).length > 0 && (
        <p className="byline">
          {Object.entries(post.metrics)
            .map(([name, value]) => `${name}: ${value.toLocaleString()}`)
            .join(' · ')}{' '}
          · at collection
        </p>
      )}
      <PostContext post={post} />
    </article>
  );
}

function RedditPost({ post }: { post: SelectedRedditPost }) {
  const safeThumbnail = post.thumbnail?.startsWith('https://')
    ? post.thumbnail
    : null;
  return (
    <article className="post-card reddit-card">
      <p className="byline">
        Reddit · r/{post.subreddit} ·{' '}
        <a href={post.authorUrl} target="_blank" rel="noreferrer">
          {post.author}
        </a>{' '}
        ·{' '}
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </time>
      </p>
      <h5>
        <a href={post.url} target="_blank" rel="noreferrer">
          {post.title}
        </a>
      </h5>
      {safeThumbnail && (
        <img
          className="reddit-thumbnail"
          src={safeThumbnail}
          alt="Post media thumbnail"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
      {post.displayText && <p className="post-text">{post.displayText}</p>}
      <p className="byline">
        {post.metrics.score.toLocaleString()} score ·{' '}
        {post.metrics.comments.toLocaleString()} comments ·{' '}
        {Math.round(post.metrics.upvoteRatio * 100)}% upvoted
      </p>
      <a href={post.url} target="_blank" rel="noreferrer">
        Open original post on Reddit
      </a>
      {post.externalUrl && post.externalUrl !== post.url && (
        <p>
          <a href={post.externalUrl} target="_blank" rel="noreferrer">
            Linked source
          </a>
        </p>
      )}
      <PostContext post={post} />
    </article>
  );
}

function BlueskyPost({ post }: { post: SelectedBlueskyPost }) {
  return (
    <article className="post-card bluesky-card">
      <p className="byline">
        Bluesky · {post.author} ·{' '}
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </time>
      </p>
      <p className="post-text">{post.text}</p>
      <div className="bluesky-media">
        {post.media?.map((media, index) => (
          <a
            key={index}
            href={media.type === 'image' ? media.fullsize : post.url}
            target="_blank"
            rel="noreferrer"
          >
            {media.thumbnail && (
              <img
                src={media.thumbnail}
                alt={
                  media.alt ||
                  (media.type === 'image' ? 'Post image' : 'Video preview')
                }
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            )}
            {media.type === 'video' && <span>Watch video on Bluesky ↗</span>}
          </a>
        ))}
      </div>
      <p className="byline">
        {post.metrics.likes.toLocaleString()} likes ·{' '}
        {post.metrics.reposts.toLocaleString()} reposts ·{' '}
        {post.metrics.replies.toLocaleString()} replies
      </p>
      <a href={post.url} target="_blank" rel="noreferrer">
        Open original post on Bluesky
      </a>
      <PostContext post={post} />
    </article>
  );
}
