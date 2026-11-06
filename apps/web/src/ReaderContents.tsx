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
    window.addEventListener('hashchange', update);
    return () => {
      observer.disconnect();
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
    const container = chips.current;
    const chip = container?.querySelector<HTMLElement>(
      '[aria-current="location"]',
    );
    if (!container || !chip || container.clientWidth === 0) return;
    const bounds = chip.getBoundingClientRect();
    const viewport = container.getBoundingClientRect();
    // Scroll only the chip row; scrollIntoView would also move the edition.
    if (bounds.left < viewport.left)
      container.scrollLeft += bounds.left - viewport.left;
    else if (bounds.right > viewport.right)
      container.scrollLeft += bounds.right - viewport.right;
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

                aria-current={active === id ? 'location' : undefined}
                className={`block ${mobile ? 'whitespace-normal break-words' : 'truncate'} rounded py-1 text-sm leading-6 hover:text-[var(--accent)] ${nested ? 'pl-3 font-normal' : 'font-medium'} ${active === id ? 'text-[var(--accent)]' : ''}`}
              >
                {text}
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
      <div className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-60 shrink-0 self-start overflow-y-auto pr-5 lg:block">
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
