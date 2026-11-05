import { customFeedSchema, type Topic, topicSchema } from '@digest/contracts';
import * as Dialog from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { statusQuery, topicsQuery } from './queries';

export function AddFeedDialog({ topics }: { topics: Topic[] }) {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!busy) {
          setOpen(value);
          setMessage('');
        }
      }}
    >
      <Dialog.Trigger asChild>
        <Button className="w-fit" disabled={!topics.length}>
          Add feed
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-[var(--surface)] p-6 shadow-xl"
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <Dialog.Title className="mt-0 font-sans text-lg font-semibold">
            Add feed
          </Dialog.Title>
          <Dialog.Description className="text-sm">
            Connect a public HTTPS RSS or Atom feed to a topic. Collection
            starts within one minute.
          </Dialog.Description>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const parsed = customFeedSchema.safeParse({
                name: data.get('name'),
                url: data.get('url'),
              });
              if (!parsed.success) {
                setMessage(
                  parsed.error.issues.map((issue) => issue.message).join(' · '),
                );
                return;
              }
              const id = String(data.get('topic'));
              if (!topics.some((topic) => topic.id === id)) return;
              setBusy(true);
              setMessage('');
              try {
                const response = await fetch(`/api/admin/topics/${id}/feeds`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(parsed.data),
                  signal: AbortSignal.timeout(15000),
                });
                if (!response.ok) throw new Error();
                const saved = topicSchema.parse(await response.json());
                client.setQueryData(topicsQuery.queryKey, (old = []) =>
                  old.map((topic) => (topic.id === saved.id ? saved : topic)),
                );
                await Promise.all([
                  client.invalidateQueries({ queryKey: statusQuery.queryKey }),
                  client.invalidateQueries({
                    queryKey: ['admin', 'source-catalog'],
                  }),
                ]);
                setMessage(
                  'Feed connected. Collection starts within one minute.',
                );
              } catch {
                setMessage(
                  'Could not confirm the change. Check the topic’s connected sources before trying again.',
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <fieldset
              disabled={busy}
              className="m-0 grid min-w-0 gap-4 border-0 p-0"
            >
              <label className="grid gap-1 text-sm">
                Topic
                <select
                  name="topic"
                  aria-label="Topic"
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-2"
                  required
                >
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                      {topic.enabled ? '' : ' (disabled)'}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                Feed name
                <Input name="name" required maxLength={120} />
              </label>
              <label className="grid gap-1 text-sm">
                Feed URL
                <Input
                  name="url"
                  required
                  type="url"
                  maxLength={2000}
                  placeholder="https://publisher.com/feed"
                />
              </label>
              <div className="flex gap-2">
                <Button type="submit">
                  {busy ? 'Connecting…' : 'Connect feed'}
                </Button>
                <Dialog.Close asChild>
                  <Button variant="ghost" type="button">
                    Close
                  </Button>
                </Dialog.Close>
              </div>
            </fieldset>
          </form>
          <p role="status" aria-live="polite" className="mb-0 text-sm">
            {message}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
