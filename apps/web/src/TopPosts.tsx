import type { SelectedPost } from '@digest/contracts';
import React from 'react';

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
    const timeout = window.setTimeout(
      () => reject(new Error('Embed timeout')),
      15000,
    );
    script.onload = () => {
      window.clearTimeout(timeout);
      const api = (window as Window & { twttr?: Widgets }).twttr;
      if (api?.widgets) resolve(api);
      else reject(new Error('Embed unavailable'));
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error('Embed unavailable'));
    };
    document.head.append(script);
  });
  return widgetScript;
}

export function TopPosts({ posts }: { posts: SelectedPost[] }) {
  return (
    <section className="top-posts" aria-label="Top posts">
      <h4>Top posts</h4>
      <p className="post-method">
        Preliminary picks · topic matching and recency, without AI editing or a
        virality score.
      </p>
      {posts.length === 0 ? (
        <p>
          No qualifying posts in this window. Nothing added to fill the space.
        </p>
      ) : (
        <div className="post-grid">
          {posts.map((post) => (
            <Post key={post.externalId} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}

function Post({ post }: { post: SelectedPost }) {
  const host = React.useRef<HTMLDivElement>(null);
  const [embedded, setEmbedded] = React.useState(false);
  React.useEffect(() => {
    const target = host.current;
    if (!target) return;
    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void loadWidgets()
          .then((api) =>
            active
              ? api.widgets.createTweet(post.externalId, target, {
                  dnt: true,
                  conversation: 'none',
                  width: 550,
                })
              : undefined,
          )
          .then((element) => {
            if (active && element) setEmbedded(true);
          })
          .catch(() => {
            /* The saved text and original link remain available. */
          });
      },
      { rootMargin: '200px' },
    );
    observer.observe(target);
    return () => {
      active = false;
      observer.disconnect();
      target.replaceChildren();
    };
  }, [post.externalId]);
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
          <p className="post-text">{post.text}</p>
        </details>
      ) : (
        <p className="post-text">{post.text}</p>
      )}
      <div ref={host} className="official-post" />
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
      <details>
        <summary>Why selected</summary>
        <ul>
          {post.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </details>
    </article>
  );
}
