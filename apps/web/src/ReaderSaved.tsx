import { Link } from '@tanstack/react-router';
import { useLayoutEffect, useRef, useState } from 'react';

import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { LinkedPostText } from './LinkedPostText';
import { readerAccountStatus } from './reader-account-status';
import { ReaderAccount } from './ReaderAccount';
import { ReaderSkipLink } from './ReaderSkipLink';
import { savedStoryAttribution } from './story-attribution';
import { storyNeedsContinuation } from './story-continuation';
import { useReaderAccount } from './use-reader-account';
import { useReaderPreferences } from './use-reader-preferences';

export function ReaderSaved() {
  const preferences = useReaderPreferences();
  const accountsEnabled = import.meta.env.VITE_READER_ACCOUNTS === '1';
  const account = useReaderAccount(accountsEnabled, preferences.accountStore);
  const [announcement, setAnnouncement] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<string | null | undefined>(undefined);
  useLayoutEffect(() => {
    if (pendingFocus.current === undefined) return;
    const target = pendingFocus.current
      ? removeButtons.current.get(pendingFocus.current)
      : heading.current;
    pendingFocus.current = undefined;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [preferences.bookmarks]);
  const saved = Object.entries(preferences.bookmarks)
    .filter(([, change]) => change.copy !== null)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-[16px] pb-16 [overflow-wrap:anywhere]">
      <ReaderSkipLink target="saved-content" />
      <header className="flex min-h-[65px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border)] py-[10px]">
        <Link
          to="/"
          className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-md text-base font-semibold sm:text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          News Digest
        </Link>
        <nav
          aria-label="Reader navigation"
          className="flex max-w-full flex-wrap items-center gap-[12px]"
        >
          <Link
            to="/editions"
            search={{ page: 1 }}
            className="inline-flex min-h-[44px] items-center rounded-md text-sm text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Past editions
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <div className="mt-[32px] flex flex-wrap items-center justify-between gap-[8px]">
        <h1
          ref={heading}
          id="saved-content"
          tabIndex={-1}
          className="scroll-m-[8px] font-sans text-2xl font-semibold"
        >
          Saved items
        </h1>
        <ReaderAccount enabled={accountsEnabled} account={account} />
      </div>
      {accountsEnabled ? (
        <p
          role="status"
          aria-label="Saved item sync"
          className="my-[16px] text-sm text-[var(--secondary)]"
        >
          {readerAccountStatus(account)}
        </p>
      ) : (
        <p className="my-[16px] text-sm text-[var(--secondary)]">
          Saved in this browser. No account is needed.
        </p>
      )}
      {accountsEnabled &&
        account.session?.signedIn &&
        account.sync === 'failed' && (
          <Button
            variant="ghost"
            className="mb-4 min-h-11"
            onClick={() => void account.retrySync().catch(() => undefined)}
          >
            Retry sync
          </Button>
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
        <div className="space-y-[16px]">
          <p>
            No saved items yet. Use Save beside a story or post in an edition.
          </p>
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center rounded-md text-sm text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Browse the latest edition
          </Link>
        </div>
      )}
      <ul className="list-none space-y-[24px] pl-0">
        {saved.map(
          ([id, { copy, updatedAt }], index) =>
            copy && (
              <li
                key={id}
                className="rounded-lg border border-[var(--border)] p-[20px] [overflow-wrap:anywhere]"
              >
                <h2 className="font-sans text-lg font-semibold">
                  <a
                    href={copy.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-[44px] min-w-[44px] items-center rounded-md [font-size:inherit] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {copy.title}
                  </a>
                </h2>
                <p className="mt-[8px] text-sm text-[var(--secondary)]">
                  {copy.platform === 'story'
                    ? savedStoryAttribution(copy.attribution, copy.url)
                    : `${copy.platform === 'x' ? 'X' : copy.platform === 'bluesky' ? 'Bluesky' : 'Reddit'} · ${copy.attribution}`}
                </p>
                {copy.publishedAt && (
                  <p className="saved-published mt-[4px] text-sm text-[var(--secondary)]">
                    Published on{' '}
                    <time dateTime={copy.publishedAt}>
                      {new Date(copy.publishedAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        timeZoneName: 'short',
                      })}
                    </time>
                  </p>
                )}
                <p className="mt-[4px] text-sm text-[var(--secondary)]">
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
                  <p className="post-text my-[12px] whitespace-pre-line leading-7">
                    {copy.platform === 'story' ? (
                      copy.excerpt
                    ) : (
                      <LinkedPostText text={copy.excerpt} postUrl={copy.url} />
                    )}
                  </p>
                )}
                {copy.context?.trim() && (
                  <p className="saved-context my-[12px] whitespace-pre-line text-sm leading-6 text-[var(--secondary)]">
                    <span className="font-semibold">Context: </span>
                    {copy.context}
                  </p>
                )}
                {!copy.excerpt.trim() && (
                  <p className="my-[12px] text-sm text-[var(--secondary)]">
                    {copy.platform === 'story'
                      ? 'Summary unavailable.'
                      : 'Post text unavailable.'}
                  </p>
                )}
                {(!copy.excerpt.trim() ||
                  (copy.platform === 'story' &&
                    storyNeedsContinuation(copy.excerpt)) ||
                  (copy.platform !== 'story' &&
                    /(?:…|\.{3})(?:\s+(?:https?:\/\/|pic\.twitter\.com\/)\S+)*\s*$/.test(
                      copy.excerpt,
                    ))) && (
                  <a
                    href={copy.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${copy.excerpt.trim() ? 'Continue reading' : 'Read source'}: ${copy.title}`}
                    className="mb-[12px] inline-flex min-h-[44px] items-center rounded-md text-sm text-[var(--accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {!copy.excerpt.trim()
                      ? 'Read source'
                      : copy.platform === 'story'
                        ? 'Continue reading at source'
                        : copy.platform === 'x'
                          ? 'Continue reading on X'
                          : copy.platform === 'bluesky'
                            ? 'Continue reading on Bluesky'
                            : copy.platform === 'reddit'
                              ? 'Continue reading on Reddit'
                              : 'Continue reading original post'}
                  </a>
                )}
                <div className="flex flex-wrap items-center justify-between gap-[16px]">
                  <Link
                    to="/editions/$id"
                    params={{ id: copy.editionId }}
                    hash={
                      id.startsWith('story:')
                        ? `story-${id.slice(6)}`
                        : `post-${encodeURIComponent(id.slice(5))}`
                    }
                    aria-label={`View edition containing saved item: ${copy.title}`}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-md text-sm text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    View edition
                  </Link>
                  <Button
                    variant="ghost"
                    className="h-auto min-h-[44px] min-w-[44px] scroll-m-[8px] px-[12px] py-[8px]"
                    aria-label={`Remove saved item: ${copy.title}`}
                    ref={(button) => {
                      if (button) removeButtons.current.set(id, button);
                      else removeButtons.current.delete(id);
                    }}
                    onClick={() => {
                      const neighbor = saved[index + 1] ?? saved[index - 1];
                      // Focus after the removed card leaves the layout.
                      pendingFocus.current = neighbor?.[0] ?? null;
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
