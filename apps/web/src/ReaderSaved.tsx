import { Link } from '@tanstack/react-router';
import { useRef } from 'react';

import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { ReaderSkipLink } from './ReaderSkipLink';
import { useReaderPreferences } from './use-reader-preferences';

export function ReaderSaved() {
  const preferences = useReaderPreferences();
  const heading = useRef<HTMLHeadingElement>(null);
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());
  const saved = Object.entries(preferences.bookmarks)
    .filter(([, change]) => change.copy !== null)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-16">
      <ReaderSkipLink target="saved-content" />
      <header className="flex h-[65px] items-center justify-between border-b border-[var(--border)]">
        <Link to="/" className="font-semibold">
          News Digest
        </Link>
        <ThemeToggle />
      </header>
      <h1
        ref={heading}
        id="saved-content"
        tabIndex={-1}
        className="mt-8 font-sans text-2xl font-semibold"
      >
        Saved items
      </h1>
      <p className="my-4 text-sm text-[var(--secondary)]">
        Saved in this browser. No account is needed.
      </p>
      {preferences.storageFailed && (
        <p role="alert">
          Your browser could not save these choices. They apply until this page
          is closed or reloaded.
        </p>
      )}
      {preferences.bookmarkError && (
        <p role="alert">{preferences.bookmarkError}</p>
      )}
      {saved.length === 0 && (
        <p>
          No saved items yet. Use Save beside a story or post in an edition.
        </p>
      )}
      <ul className="list-none space-y-6 pl-0">
        {saved.map(
          ([id, { copy }], index) =>
            copy && (
              <li
                key={id}
                className="rounded-lg border border-[var(--border)] p-5 [overflow-wrap:anywhere]"
              >
                <h2 className="font-sans text-lg font-semibold">
                  <a href={copy.url} target="_blank" rel="noreferrer">
                    {copy.title}
                  </a>
                </h2>
                <p className="mt-2 text-sm text-[var(--secondary)]">
                  {copy.platform === 'story'
                    ? copy.attribution
                    : `${copy.platform === 'x' ? 'X' : copy.platform === 'bluesky' ? 'Bluesky' : 'Reddit'} · ${copy.attribution}`}
                </p>
                {copy.excerpt && (
                  <p className="my-3 whitespace-pre-line leading-7">
                    {copy.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between gap-4">
                  <Link
                    to="/editions/$id"
                    params={{ id: copy.editionId }}
                    aria-label={`View edition containing saved item: ${copy.title}`}
                    className="text-sm text-[var(--accent)]"
                  >
                    View edition
                  </Link>
                  <Button
                    variant="ghost"
                    aria-label={`Remove saved item: ${copy.title}`}
                    ref={(button) => {
                      if (button) removeButtons.current.set(id, button);
                      else removeButtons.current.delete(id);
                    }}
                    onClick={() => {
                      const neighbor = saved[index + 1] ?? saved[index - 1];
                      const target = neighbor
                        ? removeButtons.current.get(neighbor[0])
                        : heading.current;
                      target?.focus();
                      preferences.setBookmark(id, null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ),
        )}
      </ul>
    </main>
  );
}
