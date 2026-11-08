import type { ReaderEdition } from '@digest/contracts';

import { Button } from './components/ui/button';
import { Sheet } from './components/ui/sheet';
import type { useReaderPreferences } from './use-reader-preferences';

export function ReaderPreferences({
  topics,
  preferences,
}: {
  topics: ReaderEdition['topics'];
  preferences: ReturnType<typeof useReaderPreferences>;
}) {
  return (
    <Sheet
      title="Your topics"
      trigger={
        <Button variant="ghost" className="px-2 text-sm">
          Topics
        </Button>
      }
    >
      <p className="text-sm text-[var(--secondary)]">
        Choose topics to show in this browser. New topics appear automatically.
      </p>
      <div className="space-y-2 py-4">
        {topics.map((topic) => (
          <label
            key={topic.id}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-[var(--muted)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--accent)]"
          >
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-[var(--accent)]"
              checked={!preferences.hiddenTopics[topic.id]?.hidden}
              onChange={(event) =>
                preferences.setHidden(topic.id, !event.target.checked)
              }
            />
            {topic.name}
          </label>
        ))}
      </div>
      {preferences.storageFailed && (
        <p role="alert">
          Your browser could not save these choices. They apply until this page
          is closed or reloaded.
        </p>
      )}
    </Sheet>
  );
}
