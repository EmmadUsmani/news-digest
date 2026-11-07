import { Link } from '@tanstack/react-router';

import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { useReaderPreferences } from './use-reader-preferences';

export function ReaderSaved() {
  const preferences = useReaderPreferences();
  const saved = Object.entries(preferences.bookmarks)
    .filter(([, change]) => change.copy !== null)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-16">
      <header className="flex h-[65px] items-center justify-between border-b border-[var(--border)]">
        <Link to="/" className="font-semibold">
          News Digest
        </Link>
        <ThemeToggle />
      </header>
      <h1 className="mt-8 font-sans text-2xl font-semibold">Saved items</h1>
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
        <p>No saved items yet. Use Save beside a story in an edition.</p>
      )}
      <ul className="list-none space-y-6 pl-0">
        {saved.map(
          ([id, { copy }]) =>
            copy && (
              <li
                key={id}
                className="rounded-lg border border-[var(--border)] p-5"
              >
                <h2 className="font-sans text-lg font-semibold">
                  <a href={copy.url} target="_blank" rel="noreferrer">
                    {copy.title}
                  </a>
                </h2>
                <p className="mt-2 text-sm text-[var(--secondary)]">
                  {copy.attribution}
                </p>
                {copy.excerpt && (
                  <p className="my-3 leading-7">{copy.excerpt}</p>
                )}
                <div className="flex items-center justify-between gap-4">
                  <Link
                    to="/editions/$id"
                    params={{ id: copy.editionId }}
                    className="text-sm text-[var(--accent)]"
                  >
                    View edition
                  </Link>
                  <Button
                    variant="ghost"
                    aria-label={`Remove saved item: ${copy.title}`}
                    onClick={() => preferences.setBookmark(id, null)}
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
