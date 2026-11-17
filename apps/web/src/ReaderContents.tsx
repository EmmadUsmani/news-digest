import type { ReaderEdition } from '@digest/contracts';
import { Link } from '@tanstack/react-router';
import { List } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from './components/ui/button';
import { Sheet, SheetClose } from './components/ui/sheet';

type Topic = ReaderEdition['topics'][number];
const topicAnchor = (id: string) => `topic-${id}`;

export function ReaderContents({ topics }: { topics: Topic[] }) {
  const [active, setActive] = useState('');
  const chips = useRef<HTMLDivElement>(null);
  const topicBar = useRef<HTMLDivElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);
  const selectedTarget = useRef<string | null>(null);
  useEffect(() => {
    const element = topicBar.current;
    if (!element) return;
    const root = document.documentElement;
    const measure = () =>
      root.style.setProperty(
        '--reader-topic-bar-height',
        `${element.getBoundingClientRect().height}px`,
      );
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => {
      observer.disconnect();
      root.style.removeProperty('--reader-topic-bar-height');
    };
  }, []);
  useEffect(() => {
    const targets = topics.flatMap((topic) => [
      topicAnchor(topic.id),
      ...topic.stories.map((story) => `story-${story.id}`),
      `posts-${topic.id}`,
    ]);
    const update = () => {
      // Choose the last heading above the reading line, including deep links.
      const headerHeight =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--reader-header-height',
          ),
        ) || 0;
      const readingLine = Math.max(
        180,
        headerHeight + 48,
        (chips.current?.parentElement?.getBoundingClientRect().bottom ?? 0) +
          48,
      );
      let current = targets[0] ?? '';
      for (const id of targets) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= readingLine)
          current = id;
      }
      setActive(current);
    };
    const observer = new IntersectionObserver(update, {
      rootMargin: '-100px 0px -65% 0px',
      threshold: [0, 1],
    });
    for (const id of targets) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    update();
    // Intersections alone miss a heading crossing the reading line while its
    // card remains inside the observer band. Track ordinary scrolling too.
    let scrollFrame: number | undefined;
    const onScroll = () => {
      if (scrollFrame !== undefined) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = undefined;
        update();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', update);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(scrollFrame ?? 0);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', update);
    };
  }, [topics]);
  // Restore a deep link only when opening an edition, not when its data refreshes.
  useEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;
    // Fonts and lazy post cards can resize earlier topics after the first paint.
    // Keep the opening anchor aligned until the reader starts navigating.
    let cancelled = false;
    const restore = () => {
      if (!cancelled) target.scrollIntoView({ behavior: 'instant' });
    };
    const observer = new ResizeObserver(restore);
    document.querySelectorAll('.digest-topic').forEach((topic) => {
      observer.observe(topic);
    });
    const events = [
      'wheel',
      'touchstart',
      'pointerdown',
      'keydown',
      'hashchange',
    ];
    const stop = () => {
      cancelled = true;
      observer.disconnect();
      events.forEach((event) => window.removeEventListener(event, stop));
    };
    events.forEach((event) =>
      window.addEventListener(event, stop, { passive: true }),
    );
    restore();
    void document.fonts.ready.then(restore);
    return stop;
  }, []);
  const activeTopic =
    topics.find((topic) =>
      [
        topicAnchor(topic.id),
        `posts-${topic.id}`,
        ...topic.stories.map((story) => `story-${story.id}`),
      ].includes(active),
    ) ?? topics[0];
  useEffect(() => {
    const container = sidebar.current;
    if (!container) return;
    const reveal = () => {
      const entry = container.querySelector<HTMLElement>(
        '[aria-current="location"]',
      );
      if (!entry || container.clientHeight === 0) return;
      const bounds = entry.getBoundingClientRect();
      const viewport = container.getBoundingClientRect();
      // Reveal the current entry without scrolling the edition itself.
      if (bounds.top < viewport.top)
        container.scrollTop += bounds.top - viewport.top;
      else if (bounds.bottom > viewport.bottom)
        container.scrollTop += bounds.bottom - viewport.bottom;
    };
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(container);
    return () => observer.disconnect();
  }, [active]);
  useEffect(() => {
    const container = chips.current;
    if (!container) return;
    const reveal = () => {
      const chip = container.querySelector<HTMLElement>(
        '[aria-current="location"]',
      );
      if (!chip || container.clientWidth === 0) return;
      const bounds = chip.getBoundingClientRect();
      const viewport = container.getBoundingClientRect();
      // Scroll only the chip row; scrollIntoView would also move the edition.
      if (bounds.left < viewport.left)
        container.scrollLeft += bounds.left - viewport.left;
      else if (bounds.right > viewport.right)
        container.scrollLeft += bounds.right - viewport.right;
    };
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeTopic?.id]);
  const contents = (mobile: boolean) => (
    <nav aria-label={mobile ? 'Mobile contents' : 'Edition contents'}>
      <p className="mb-4 text-xs font-medium tracking-widest text-[var(--secondary)] uppercase">
        Contents
      </p>
      <ul className="m-0 list-none space-y-4 p-0">
        {topics.map((topic) => {
          const link = (id: string, text: string, nested = false) => {
            const anchor = (
              <a
                href={`#${id}`}
                onClick={
                  mobile
                    ? () => {
                        selectedTarget.current = id;
                      }
                    : undefined
                }

                title={text}
                aria-current={active === id ? 'location' : undefined}
                className={`flex min-h-11 min-w-0 items-center gap-[4px] rounded py-1 text-sm leading-6 hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${nested ? 'pl-[12px] font-normal' : 'font-medium'} ${active === id ? 'text-[var(--accent)]' : ''}`}
              >
                <span
                  aria-hidden="true"
                  className="w-[12px] shrink-0 text-center text-[16px]"
                >
                  {nested
                    ? active === id
                      ? '▸'
                      : ''
                    : activeTopic?.id === topic.id
                      ? '▾'
                      : '›'}
                </span>
                <span className="min-w-0 [font-size:inherit] [overflow-wrap:anywhere]">
                  {text}
                </span>
              </a>
            );
            return mobile ? <SheetClose asChild>{anchor}</SheetClose> : anchor;
          };
          return (
            <li key={topic.id}>
              {link(topicAnchor(topic.id), topic.name)}
              {activeTopic?.id === topic.id && (
                <ul className="m-0 list-none p-0 text-[var(--secondary)]">
                  {topic.stories.map((story) => (
                    <li key={story.id}>
                      {link(`story-${story.id}`, story.title, true)}
                    </li>
                  ))}
                  <li>{link(`posts-${topic.id}`, 'Posts', true)}</li>
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      <Link
        to="/editions"
        search={{ page: 1 }}
        className="mt-8 inline-flex min-h-11 min-w-11 items-center rounded-md text-sm font-medium text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        Past editions →
      </Link>
    </nav>
  );
  return (
    <>
      <div
        ref={sidebar}
        className="sticky top-[calc(var(--reader-header-height,65px)+1rem)] hidden max-h-[calc(100vh-var(--reader-header-height,65px)-2rem)] w-[240px] shrink-0 self-start overflow-y-auto pr-[20px] lg:block"
      >
        {contents(false)}
      </div>
      <div
        ref={topicBar}
        className="reader-topic-navigation fixed inset-x-0 top-[var(--reader-header-height,65px)] z-20 flex items-center gap-[8px] border-b border-[var(--border)] bg-[var(--background)] px-[16px] py-[8px] lg:hidden"
      >
        <div
          ref={chips}
          className="flex min-w-0 flex-1 gap-[8px] overflow-x-auto"
        >
          {topics.map((topic) => (
            <a
              key={topic.id}
              href={`#${topicAnchor(topic.id)}`}

              aria-current={
                activeTopic?.id === topic.id ? 'location' : undefined
              }
              className={`inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center rounded-full px-[12px] py-[4px] text-sm font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)] ${activeTopic?.id === topic.id ? 'bg-[var(--muted)]' : 'text-[var(--secondary)]'}`}
            >
              {topic.name}
            </a>
          ))}
        </div>
        <Sheet
          title="Edition contents"
          onOpenAutoFocus={(event) => {
            const current = document.querySelector<HTMLElement>(
              'nav[aria-label="Mobile contents"] [aria-current="location"]',
            );
            if (current) {
              event.preventDefault();
              current.focus();
            }
          }}
          onCloseAutoFocus={(event) => {
            const target =
              selectedTarget.current &&
              document.getElementById(selectedTarget.current);
            selectedTarget.current = null;
            if (target) {
              event.preventDefault();
              target.focus({ preventScroll: true });
            }
          }}
          trigger={
            <Button
              variant="ghost"
              aria-label="Contents"
              title="Edition contents"
              className="h-auto min-h-[44px] min-w-[44px] shrink-0 px-[8px] py-[8px] text-sm [&_svg]:size-[20px]"
            >
              <List aria-hidden="true" className="reader-contents-icon" />
              <span className="reader-contents-label">Contents</span>
            </Button>
          }
        >
          {contents(true)}
        </Sheet>
      </div>
    </>
  );
}
