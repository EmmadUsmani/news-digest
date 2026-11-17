import type { ReaderEdition } from '@digest/contracts';

import { Button } from './components/ui/button';
import { Sheet } from './components/ui/sheet';
import { readerAccountStatus } from './reader-account-status';
import type { useReaderAccount } from './use-reader-account';
import type { useReaderPreferences } from './use-reader-preferences';

export function ReaderPreferences({
  topics,
  preferences,
  account,
}: {
  topics: ReaderEdition['topics'];
  preferences: ReturnType<typeof useReaderPreferences>;
  account?: ReturnType<typeof useReaderAccount>;
}) {
  return (
    <Sheet
      title="Your topics"
      trigger={
        <Button
          variant="ghost"
          className="h-auto min-h-[44px] min-w-[44px] px-[8px] py-[8px] text-sm"
        >
          Topics
        </Button>
      }
    >
      <p className="text-sm text-[var(--secondary)] [overflow-wrap:anywhere]">
        Choose topics to show.
      </p>
      <div className="space-y-[8px] py-[16px]">
        {topics.map((topic) => (
          <label
            key={topic.id}
            className="flex min-h-[44px] cursor-pointer items-center gap-[12px] rounded-md px-[12px] py-[8px] hover:bg-[var(--muted)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--accent)]"
          >
            <input
              type="checkbox"
              className="size-[16px] shrink-0 accent-[var(--accent)]"
              checked={!preferences.hiddenTopics[topic.id]?.hidden}
              onChange={(event) =>
                preferences.setHidden(topic.id, !event.target.checked)
              }
            />
            <span className="min-w-0 [overflow-wrap:anywhere]">
              {topic.name}
            </span>
          </label>
        ))}
      </div>
      <p className="text-sm text-[var(--secondary)] [overflow-wrap:anywhere]">
        New topics appear automatically.
      </p>
      {account && (
        <p
          role="status"
          aria-label="Topic sync"
          className="mt-3 text-sm text-[var(--secondary)]"
        >
          {readerAccountStatus(account)}
        </p>
      )}
      {account?.session?.signedIn && account.sync === 'failed' && (
        <Button
          variant="ghost"
          className="mt-3 min-h-11"
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
    </Sheet>
  );
}
