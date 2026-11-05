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
      options: { dnt: boolean; conversation: string; width: number },
    ) => Promise<HTMLElement | undefined>;
  };
};
let widgetScript: Promise<Widgets> | undefined;
function loadWidgets(): Promise<Widgets> {
  widgetScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    const fail = () => {
      script.remove();
      reject(new Error('Embed unavailable'));
    };
    const timeout = window.setTimeout(fail, 15000);
    script.onload = () => {
      window.clearTimeout(timeout);
      const api = (window as Window & { twttr?: Widgets }).twttr;
      if (api?.widgets) resolve(api);
      else fail();
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      fail();
    };
    document.head.append(script);
  });
  return widgetScript;
}

export function TopPosts({ posts }: { posts: ReaderPost[] }) {
  return (
    <section className="top-posts" aria-label="Top posts">
      <h4>Top posts</h4>
      {posts.length === 0 ? (
        <p>
          No qualifying posts in this window. Nothing added to fill the space.
        </p>
      ) : (
        <div className="post-grid">
          {posts.map((post) =>
            post.platform === 'bluesky' ? (
              <BlueskyPost key={`bluesky:${post.externalId}`} post={post} />
            ) : post.platform === 'reddit' ? (
              <RedditPost key={`reddit:${post.externalId}`} post={post} />
            ) : (
              <Post key={`x:${post.externalId}`} post={post} />
            ),
          )}
        </div>
      )}
    </section>
  );
}

function Post({ post }: { post: SelectedPost }) {
  const host = React.useRef<HTMLDivElement>(null);
  const [embedded, setEmbedded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
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
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void loadWidgets()
          .then((api) => {
            if (!active) return undefined;
            widgetTimeout = window.setTimeout(() => {
              active = false;
              attemptTarget.remove();
              setFailed(true);
            }, 15000);
            return api.widgets.createTweet(post.externalId, attemptTarget, {
              dnt: true,
              conversation: 'none',
              width: 550,
            });
          })
          .then((element) => {
            window.clearTimeout(widgetTimeout);
            if (!active) return;
            if (element) setEmbedded(true);
            else setFailed(true);
          })
          .catch(() => {
            window.clearTimeout(widgetTimeout);
            if (active) setFailed(true);
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
  }, [post.externalId, attempt]);
  return (
    <article className="post-card">
      <p className="byline">
        X · {post.author} ·{' '}
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleString()}
        </time>
      </p>
      {embedded ? (
        <details className="saved-post-text">
          <summary>Saved post text</summary>
          <p className="post-text">{post.displayText ?? post.text}</p>
        </details>
      ) : (
        <p className="post-text">{post.displayText ?? post.text}</p>
      )}
      <div ref={host} className="official-post" />
      {failed && (
        <div className="post-embed-status" role="status">
          <p>X media could not load. Saved text is shown above.</p>
          <button
            type="button"
            onClick={() => {
              widgetScript = undefined;
              setAttempt((value) => value + 1);
            }}
          >
            Retry X media
          </button>
        </div>
      )}
      <a href={post.url} target="_blank" rel="noreferrer">
        Open original post on X
      </a>
      {Object.keys(post.metrics).length > 0 && (
        <p className="byline">
          {Object.entries(post.metrics)
            .map(([name, value]) => `${name}: ${value.toLocaleString()}`)
            .join(' · ')}{' '}
          · at collection
        </p>
      )}
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
          {new Date(post.publishedAt).toLocaleString()}
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
    </article>
  );
}

function BlueskyPost({ post }: { post: SelectedBlueskyPost }) {
  return (
    <article className="post-card bluesky-card">
      <p className="byline">
        Bluesky · {post.author} ·{' '}
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleString()}
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
    </article>
  );
}
