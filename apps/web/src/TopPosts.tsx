import type { ReaderEdition } from '@digest/contracts';
import React from 'react';

import { Card } from './components/ui/card';
import { StoryTime } from './StoryTime';

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
    <section
      className="top-posts mt-8 max-w-none border-t border-[var(--border)] p-0 pt-4"
      aria-label="Top posts"
    >
      <h3 className="m-0 mb-3 font-sans text-xl leading-7 font-semibold tracking-tight">
        Posts
      </h3>
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
  const note = post.whyItMatters?.trim();
  const normalize = (text: string) =>
    text.trim().replace(/\s+/g, ' ').toLowerCase();
  const postTexts =
    post.platform === 'reddit'
      ? [post.title, post.displayText]
      : [post.text, post.displayText];
  if (
    !note ||
    postTexts.some((text) => text && normalize(text) === normalize(note))
  )
    return null;
  return (
    <p
      className="post-context min-w-0 truncate text-sm text-[var(--secondary)]"
      title={note}
    >
      <span className="post-context-text">{note}</span>
    </p>
  );
}

function Post({
  post,
  theme,
}: {
  post: SelectedPost;
  theme: 'light' | 'dark';
}) {
  const host = React.useRef<HTMLDivElement>(null);
  const savedText = React.useRef<HTMLDetailsElement>(null);
  const [embedded, setEmbedded] = React.useState(false);
  const [hasEmbedded, setHasEmbedded] = React.useState(false);
  const [savedTextOpen, setSavedTextOpen] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  React.useEffect(() => {
    const target = host.current;
    if (!target) return;
    let active = true;
    let widgetTimeout: number | undefined;
    let resizeTimeout: number | undefined;
    let resizeObserver: ResizeObserver | undefined;
    const mediaWidth = () => Math.min(550, Math.max(250, target.clientWidth));
    let requestedWidth: number;
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
              target.style.minHeight = '';
            }, 15000);
            requestedWidth = mediaWidth();
            return api.widgets.createTweet(post.externalId, attemptTarget, {
              dnt: true,
              conversation: 'none',
              width: requestedWidth,
              theme,
            });
          })
          .then((element) => {
            window.clearTimeout(widgetTimeout);
            if (!active) return;
            setLoading(false);
            target.style.minHeight = '';
            if (element) {
              if (
                document.activeElement?.tagName === 'A' &&
                savedText.current?.contains(document.activeElement)
              )
                setSavedTextOpen(true);
              setHasEmbedded(true);
              setEmbedded(true);
              // X fixes its iframe width at creation. Rebuild successful media
              // after the card settles at a different width (e.g. rotation).
              resizeObserver = new ResizeObserver(() => {
                window.clearTimeout(resizeTimeout);
                if (mediaWidth() !== requestedWidth) {
                  resizeTimeout = window.setTimeout(() => {
                    if (active) setAttempt((value) => value + 1);
                  }, 200);
                }
              });
              resizeObserver.observe(target);
            } else {
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
              target.style.minHeight = '';
            }
          });
      },
      { rootMargin: '200px' },
    );
    observer.observe(target);
    return () => {
      active = false;
      window.clearTimeout(widgetTimeout);
      window.clearTimeout(resizeTimeout);
      resizeObserver?.disconnect();
      observer.disconnect();
      // Keep the reader's place while a theme/width change replaces media.
      target.style.minHeight = `${target.getBoundingClientRect().height}px`;
      target.replaceChildren();
    };
  }, [post.externalId, attempt, theme]);
  return (
    <Card as="article" className="post-card min-w-0 rounded-lg p-5 shadow-none">
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
        <a
          href={post.url}
          target="_blank"
          rel="noreferrer"
          aria-label="View post on X"
          className="text-xs font-normal hover:text-[var(--accent)]"
        >
          <StoryTime publishedAt={post.publishedAt} />
        </a>
      </p>
      <details
        ref={savedText}
        className="saved-post-text"
        open={!embedded || savedTextOpen}
        onToggle={(event) => {
          if (embedded) setSavedTextOpen(event.currentTarget.open);
        }}
      >
        <summary hidden={!hasEmbedded}>Saved post text</summary>
        <p className="post-text">
          <LinkedPostText
            text={post.displayText ?? post.text}
            postUrl={post.url}
          />
        </p>
      </details>
      <div ref={host} className="official-post" />
      {loading && (
        <p role="status" className="m-0 text-xs text-[var(--secondary)]">
          Loading X post…
        </p>
      )}
      {failed && (
        <div className="x-media-error flex flex-wrap items-center gap-x-2 gap-y-1">
          <p role="status" className="m-0 text-xs text-[var(--secondary)]">
            X media unavailable.
          </p>
          <button
            type="button"
            className="min-h-8 border-0 bg-transparent px-1 py-1 text-xs text-[var(--secondary)] underline underline-offset-4 hover:text-[var(--accent)]"
            onClick={() => {
              savedText.current?.querySelector('a')?.focus();
              setAttempt((value) => value + 1);
            }}
          >
            Retry X post
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
    </Card>
  );
}

function RedditPost({ post }: { post: SelectedRedditPost }) {
  const safeThumbnail = post.thumbnail?.startsWith('https://')
    ? post.thumbnail
    : null;
  return (
    <Card
      as="article"
      className="post-card reddit-card min-w-0 rounded-lg p-5 shadow-none"
    >
      <p className="byline">
        Reddit · r/{post.subreddit} ·{' '}
        <a href={post.authorUrl} target="_blank" rel="noreferrer">
          {post.author}
        </a>{' '}
        · <StoryTime publishedAt={post.publishedAt} />
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
    </Card>
  );
}

function LinkedPostText({ text, postUrl }: { text: string; postUrl: string }) {
  return text.split(/(https?:\/\/[^\s<>]+)/g).map((part, index) => {
    if (!/^https?:\/\//.test(part))
      return part ? (
        <a key={index} href={postUrl} target="_blank" rel="noreferrer">
          {part}
        </a>
      ) : null;
    // Leave sentence punctuation outside the link without changing saved text.
    let url = part.replace(/[.,;:!?]+$/, '');
    // Keep balanced URL parentheses (e.g. Wikipedia titles), but exclude
    // closing delimiters belonging to the surrounding sentence.
    while (/[)\]}]$/.test(url)) {
      const close = url.at(-1)!;
      const open = { ')': '(', ']': '[', '}': '{' }[close]!;
      if (url.split(close).length <= url.split(open).length) break;
      url = url.slice(0, -1).replace(/[.,;:!?]+$/, '');
    }
    try {
      new URL(url);
    } catch {
      return part;
    }
    return (
      <React.Fragment key={index}>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {url}
        </a>
        {part.slice(url.length)}
      </React.Fragment>
    );
  });
}

function BlueskyImage({
  src,
  alt,
  video,
}: {
  src: string;
  alt: string;
  video: boolean;
}) {
  const [failed, setFailed] = React.useState(false);
  return failed ? (
    <span className="text-sm text-[var(--secondary)] underline underline-offset-2">
      {video ? 'Preview unavailable' : 'Image unavailable · Open image ↗'}
      <span className="sr-only">{` — ${alt}`}</span>
    </span>
  ) : (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

function BlueskyPost({ post }: { post: SelectedBlueskyPost }) {
  return (
    <Card
      as="article"
      className="post-card bluesky-card @container min-w-0 rounded-lg p-5 shadow-none"
    >
      <p className="byline">
        Bluesky ·{' '}
        <a
          href={post.url.replace(/\/post\/[^/?#]+(?:[?#].*)?$/, '')}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-normal hover:text-[var(--accent)]"
        >
          {post.author}
        </a>{' '}
        ·{' '}
        <a
          href={post.url}
          target="_blank"
          rel="noreferrer"
          aria-label="View post on Bluesky"
          className="text-xs font-normal hover:text-[var(--accent)]"
        >
          <StoryTime publishedAt={post.publishedAt} />
        </a>
      </p>
      <p className="post-text">
        <LinkedPostText text={post.text} postUrl={post.url} />
      </p>
      <div
        className={`bluesky-media grid grid-cols-1 gap-2 ${(post.media?.length ?? 0) > 1 ? '@min-[480px]:grid-cols-2' : ''}`}
      >
        {post.media?.map((media, index) => (
          <a
            key={index}
            href={media.type === 'image' ? media.fullsize : post.url}
            target="_blank"
            rel="noreferrer"
          >
            {media.thumbnail && (
              <BlueskyImage
                key={media.thumbnail}
                video={media.type === 'video'}
                src={media.thumbnail}
                alt={
                  media.alt ||
                  (media.type === 'image' ? 'Post image' : 'Video preview')
                }
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
      <PostContext post={post} />
    </Card>
  );
}
