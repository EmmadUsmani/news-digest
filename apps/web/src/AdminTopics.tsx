import {
  type TopicSettings,
  topicSettingsSchema,
  topicUpdateSchema,
} from '@digest/contracts';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { useState } from 'react';

import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { identityQuery, profileQuery, topicsQuery } from './queries';

export function AdminTopics() {
  const client = useQueryClient();
  const query = useQuery(topicsQuery);
  const identity = useQuery(identityQuery);
  const readOnly = identity.data?.isAdmin !== true;
  const profile = useQuery({ ...profileQuery, enabled: !readOnly });
  const topics = query.data ?? [];
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [dragged, setDragged] = useState<string | null>(null);

  async function write(
    path: string,
    method: string,
    body: unknown,
    order = false,
  ) {
    if (readOnly) return false;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/topics${path}`, {
        method,
        signal: AbortSignal.timeout(15_000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error();
      const result: unknown = await response.json();
      if (order)
        client.setQueryData(
          topicsQuery.queryKey,
          topicSettingsSchema.array().parse(result),
        );
      else {
        const saved = topicSettingsSchema.parse(result);
        client.setQueryData(topicsQuery.queryKey, (old = []) =>
          old.some((topic) => topic.id === saved.id)
            ? old.map((topic) => (topic.id === saved.id ? saved : topic))
            : [...old, saved],
        );
      }
      setMessage('Saved. Changes apply to new editions.');
      setCreating(false);
      return true;
    } catch {
      setMessage(
        'Could not confirm the save. Reload topics to check the saved settings before trying again.',
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  function move(id: string, destination: number) {
    if (readOnly || busy || destination < 0 || destination >= topics.length)
      return;
    const ordered = [...topics];
    const index = ordered.findIndex((topic) => topic.id === id);
    if (index < 0 || index === destination) return;
    const [item] = ordered.splice(index, 1);
    ordered.splice(destination, 0, item);
    void write(
      '/order',
      'PUT',
      { ids: ordered.map((topic) => topic.id) },
      true,
    );
  }
  function update(topic: TopicSettings, changes: Partial<TopicSettings>) {
    void write(`/${topic.id}`, 'PUT', {
      ...topicUpdateSchema.strip().parse(topic),
      ...changes,
    });
  }
  return (
    <section aria-label="Topic management" className="grid max-w-4xl gap-4 p-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-sm text-[var(--secondary)]">
          {readOnly
            ? 'Read-only topics. Sign in as an admin to change them.'
            : 'Drag to set reading order, or use the arrows. Budgets apply to new editions.'}
        </p>
        <Dialog.Root
          open={creating}
          onOpenChange={(open) => {
            if (!busy) setCreating(open);
          }}
        >
          <Dialog.Trigger asChild>
            <Button disabled={readOnly || busy}>New topic</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-[var(--surface)] p-6 shadow-xl">
              <Dialog.Title className="mt-0 font-sans text-lg font-semibold">
                New topic
              </Dialog.Title>
              <Dialog.Description className="text-sm">
                Create a topic, then open it to connect sources and set
                guidance.
              </Dialog.Description>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  const input = topicUpdateSchema.safeParse({
                    name: data.get('name'),
                    description: data.get('description'),
                    includeGuidance: '',
                    excludeGuidance: '',
                    enabled: true,
                    storyBudget: Number(data.get('storyBudget')),
                    postBudget: Number(data.get('postBudget')),
                    relevancePolicy: { includeAny: [], excludeAny: [] },
                    accounts: [],
                    redditCommunities: [],
                  });
                  if (input.success) void write('', 'POST', input.data);
                }}
              >
                <fieldset
                  disabled={readOnly || busy}
                  className="grid gap-4 border-0 p-0"
                >
                  <label className="grid gap-2 text-sm">
                    Name
                    <Input name="name" required maxLength={120} />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Description
                    <Textarea name="description" maxLength={2000} />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="grid gap-2 text-sm">
                      Story budget
                      <Input
                        name="storyBudget"
                        type="number"
                        min={0}
                        max={20}
                        required
                        defaultValue={profile.data?.schedule.storyBudget ?? 5}
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      Post budget
                      <Input
                        name="postBudget"
                        type="number"
                        min={0}
                        max={20}
                        required
                        defaultValue={profile.data?.schedule.postBudget ?? 5}
                      />
                    </label>
                  </div>
                  <p role="status">{message}</p>
                  <div className="flex gap-2">
                    <Button type="submit">
                      {busy ? 'Saving…' : 'Create topic'}
                    </Button>
                    <Dialog.Close asChild>
                      <Button variant="ghost">Cancel</Button>
                    </Dialog.Close>
                  </div>
                </fieldset>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      {query.isPending && <p role="status">Loading topics…</p>}
      {query.isError && <p role="alert">Topics could not be loaded.</p>}
      <Button
        variant="ghost"
        disabled={busy || query.isFetching}
        onClick={() => void query.refetch()}
      >
        Reload topics
      </Button>
      <ol className="m-0 grid list-none gap-3 p-0">
        {topics.map((topic, index) => (
          <li
            key={topic.id}
            draggable={!readOnly && !busy}
            onDragStart={(event) => {
              setDragged(topic.id);
              event.dataTransfer.setData('text/plain', topic.id);
            }}
            onDragEnd={() => setDragged(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (!readOnly && dragged) move(dragged, index);
              setDragged(null);
            }}
          >
            <Card className="flex flex-wrap items-center gap-4">
              <GripVertical
                aria-hidden="true"
                className="size-5 shrink-0 text-[var(--secondary)]"
              />
              <div className="min-w-0 basis-[calc(100%-3rem)] sm:basis-0 sm:flex-1">
                <h2 className="m-0 font-sans text-base font-semibold">
                  <Link
                    to="/admin/topics/$id"
                    params={{ id: topic.id }}
                    className="underline decoration-transparent hover:decoration-current"
                  >
                    {topic.name}
                  </Link>
                </h2>
                <p className="mb-0 line-clamp-2 text-sm text-[var(--secondary)]">
                  {topic.description}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${topic.name} up`}
                  disabled={readOnly || busy || index === 0}
                  onClick={() => move(topic.id, index - 1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${topic.name} down`}
                  disabled={readOnly || busy || index === topics.length - 1}
                  onClick={() => move(topic.id, index + 1)}
                >
                  <ArrowDown />
                </Button>
                <Button
                  role="switch"
                  aria-checked={topic.enabled}
                  aria-label={`Enable ${topic.name}`}
                  disabled={readOnly || busy}
                  variant={topic.enabled ? 'default' : 'ghost'}
                  onClick={() => update(topic, { enabled: !topic.enabled })}
                >
                  {topic.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <form
                className="flex w-full flex-wrap items-end gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  update(topic, {
                    storyBudget: Number(data.get('stories')),
                    postBudget: Number(data.get('posts')),
                  });
                }}
              >
                <label className="grid w-28 gap-2 text-sm">
                  Stories
                  <Input
                    aria-label={`${topic.name} story budget`}
                    key={`s-${topic.storyBudget}`}
                    name="stories"
                    type="number"
                    min={0}
                    max={20}
                    required
                    defaultValue={topic.storyBudget}
                    disabled={readOnly || busy}
                  />
                </label>
                <label className="grid w-28 gap-2 text-sm">
                  Posts
                  <Input
                    aria-label={`${topic.name} post budget`}
                    key={`p-${topic.postBudget}`}
                    name="posts"
                    type="number"
                    min={0}
                    max={20}
                    required
                    defaultValue={topic.postBudget}
                    disabled={readOnly || busy}
                  />
                </label>
                <Button
                  type="submit"
                  variant="ghost"
                  disabled={readOnly || busy}
                >
                  Save {topic.name} budgets
                </Button>
              </form>
            </Card>
          </li>
        ))}
      </ol>
      {!query.isPending && !query.isError && topics.length === 0 && (
        <p>
          {readOnly
            ? 'No topics yet.'
            : 'No topics yet. Create your first topic.'}
        </p>
      )}
      <p role="status">{message}</p>
    </section>
  );
}
