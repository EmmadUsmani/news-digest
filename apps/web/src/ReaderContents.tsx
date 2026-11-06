import type { ReaderEdition } from '@digest/contracts';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { Button } from './components/ui/button';
import { Sheet, SheetClose } from './components/ui/sheet';

type Topic = ReaderEdition['topics'][number];
const topicAnchor = (id: string) => `topic-${id}`;

export function ReaderContents({ topics }: { topics: Topic[] }) {
  const [active, setActive] = useState('');
  const chips = useRef<HTMLDivElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);
  const selectedTarget = useRef<string | null>(null);
  useEffect(() => {
    const targets = topics.flatMap((topic) => [
      topicAnchor(topic.id),
      ...topic.stories.map((story) => `story-${story.id}`),
      `posts-${topic.id}`,
    ]);
    const update = () => {
      // Choose the last heading above the reading line, including deep links.
      let current = targets[0] ?? '';
      for (const id of targets) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 180) current = id;
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
    const initialTarget = document.getElementById(
      window.location.hash.slice(1),
    );
    initialTarget?.scrollIntoView();
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
                className={`flex min-w-0 items-center gap-1 rounded py-1 text-sm leading-6 hover:text-[var(--accent)] ${nested ? 'pl-3 font-normal' : 'font-medium'} ${active === id ? 'text-[var(--accent)]' : ''}`}
              >
                <span aria-hidden="true" className="w-3 shrink-0 text-center">
                  {nested
                    ? active === id
                      ? '▸'
                      : ''
                    : activeTopic?.id === topic.id
                      ? '▾'
                      : '›'}
                </span>
                <span className="min-w-0 truncate">{text}</span>
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
        className="mt-8 block text-sm font-medium text-[var(--accent)]"
      >
        Past editions →
      </Link>
    </nav>
  );
  return (
    <>
      <div
        ref={sidebar}
        className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-60 shrink-0 self-start overflow-y-auto pr-5 lg:block"
      >
        {contents(false)}
      </div>
      <div className="fixed inset-x-0 top-[65px] z-20 flex items-center gap-2 border-b border-[var(--border)] bg-[var(--background)] px-4 py-2 lg:hidden">
        <div ref={chips} className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {topics.map((topic) => (
            <a
              key={topic.id}
              href={`#${topicAnchor(topic.id)}`}

              aria-current={
                activeTopic?.id === topic.id ? 'location' : undefined
              }
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${activeTopic?.id === topic.id ? 'bg-[var(--muted)]' : 'text-[var(--secondary)]'}`}
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
            <Button variant="ghost" className="px-2 text-sm">
              Contents
            </Button>
          }
        >
          {contents(true)}
        </Sheet>
      </div>
    </>
  );
}
