import { Link } from '@tanstack/react-router';
import { useRef, useState } from 'react';

import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { LinkedPostText } from './LinkedPostText';
import { readerAccountStatus } from './reader-account-status';
import { ReaderAccount } from './ReaderAccount';
import { ReaderSkipLink } from './ReaderSkipLink';
import { useReaderAccount } from './use-reader-account';
import { useReaderPreferences } from './use-reader-preferences';

export function ReaderSaved() {
  const preferences = useReaderPreferences();
  const accountsEnabled = import.meta.env.VITE_READER_ACCOUNTS === '1';
  const account = useReaderAccount(accountsEnabled, preferences.accountStore);
  const [announcement, setAnnouncement] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());
  const saved = Object.entries(preferences.bookmarks)
    .filter(([, change]) => change.copy !== null)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-16">
      <ReaderSkipLink target="saved-content" />
      <header className="flex h-[65px] items-center justify-between gap-3 border-b border-[var(--border)]">
        <Link
          to="/"
          className="inline-flex min-h-11 min-w-11 items-center whitespace-nowrap rounded-md text-base font-semibold sm:text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          News Digest
        </Link>
        <nav
          aria-label="Reader navigation"
          className="flex shrink-0 items-center gap-3"
        >
          <Link
            to="/editions"
            search={{ page: 1 }}
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-md text-sm text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Past editions
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <div className="mt-8 flex items-center justify-between gap-2">
        <h1
          ref={heading}
          id="saved-content"
          tabIndex={-1}
          className="font-sans text-2xl font-semibold"
        >
          Saved items
        </h1>
        <ReaderAccount enabled={accountsEnabled} account={account} />
      </div>
      {accountsEnabled ? (
        <p
          role="status"
          aria-label="Saved item sync"
          className="my-4 text-sm text-[var(--secondary)]"
        >
          {readerAccountStatus(account)}
        </p>
      ) : (
        <p className="my-4 text-sm text-[var(--secondary)]">
          Saved in this browser. No account is needed.
        </p>
      )}
      {preferences.storageFailed && (
        <p role="alert">
          Your browser could not save these choices. They apply until this page
          is closed or reloaded.
        </p>
      )}
      {preferences.bookmarkError && (
        <p role="alert">{preferences.bookmarkError}</p>
      )}
      <p role="status" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
      {saved.length === 0 && (
        <div className="space-y-4">
          <p>
            No saved items yet. Use Save beside a story or post in an edition.
          </p>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-md text-sm text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Browse the latest edition
          </Link>
        </div>
      )}
      <ul className="list-none space-y-6 pl-0">
        {saved.map(
          ([id, { copy, updatedAt }], index) =>
            copy && (
              <li
                key={id}
                className="rounded-lg border border-[var(--border)] p-5 [overflow-wrap:anywhere]"
              >
                <h2 className="font-sans text-lg font-semibold">
                  <a
                    href={copy.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-11 min-w-11 items-center rounded-md hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {copy.title}
                  </a>
                </h2>
                <p className="mt-2 text-sm text-[var(--secondary)]">
                  {copy.platform === 'story'
                    ? copy.attribution
                    : `${copy.platform === 'x' ? 'X' : copy.platform === 'bluesky' ? 'Bluesky' : 'Reddit'} · ${copy.attribution}`}
                </p>
                {copy.publishedAt && (
                  <p className="saved-published mt-1 text-sm text-[var(--secondary)]">
                    Published on{' '}
                    <time dateTime={copy.publishedAt}>
                      {new Date(copy.publishedAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </time>
                  </p>
                )}
                <p className="mt-1 text-sm text-[var(--secondary)]">
                  Saved on{' '}
                  <time dateTime={new Date(updatedAt).toISOString()}>
                    {new Date(updatedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </p>
                {copy.excerpt && (
                  <p className="post-text my-3 whitespace-pre-line leading-7">
                    {copy.platform === 'story' ? (
                      copy.excerpt
                    ) : (
                      <LinkedPostText text={copy.excerpt} postUrl={copy.url} />
                    )}
                  </p>
                )}
                {copy.context?.trim() && (
                  <p className="saved-context my-3 whitespace-pre-line text-sm leading-6 text-[var(--secondary)]">
                    <span className="font-semibold">Context: </span>
                    {copy.context}
                  </p>
                )}
                {copy.platform === 'story' && !copy.excerpt.trim() && (
                  <p className="my-3 text-sm text-[var(--secondary)]">
                    Summary unavailable.
                  </p>
                )}
                {((copy.platform === 'story' &&
                  (!copy.excerpt.trim() ||
                    /(?:…|\.{3})\s*$/.test(copy.excerpt))) ||
                  (copy.platform === 'x' &&
                    /(?:…|\.{3})(?:\s+(?:https?:\/\/|pic\.twitter\.com\/)\S+)*\s*$/.test(
                      copy.excerpt,
                    ))) && (
                  <a
                    href={copy.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${copy.excerpt.trim() ? 'Continue reading' : 'Read source'}: ${copy.title}`}
                    className="mb-3 inline-flex min-h-11 items-center rounded-md text-sm text-[var(--accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {!copy.excerpt.trim()
                      ? 'Read source'
                      : copy.platform === 'x'
                        ? 'Continue reading on X'
                        : 'Continue reading at source'}
                  </a>
                )}
                <div className="flex items-center justify-between gap-4">
                  <Link
                    to="/editions/$id"
                    params={{ id: copy.editionId }}
                    hash={
                      id.startsWith('story:')
                        ? `story-${id.slice(6)}`
                        : `post-${encodeURIComponent(id.slice(5))}`
                    }
                    aria-label={`View edition containing saved item: ${copy.title}`}
                    className="inline-flex min-h-11 min-w-11 items-center rounded-md text-sm text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    View edition
                  </Link>
                  <Button
                    variant="ghost"
                    className="min-h-11 min-w-11"
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
                      const remaining = saved.length - 1;
                      setAnnouncement(
                        `Removed ${copy.title}. ${remaining === 0 ? 'No saved items remaining.' : `${remaining} saved ${remaining === 1 ? 'item' : 'items'} remaining.`}`,
                      );
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
