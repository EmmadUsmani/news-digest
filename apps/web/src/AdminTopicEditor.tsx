import {
  sourceCatalogSchema,
  type Topic,
  topicSchema,
  topicUpdateSchema,
} from '@digest/contracts';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';

import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { topicsQuery } from './queries';

export function AdminTopicEditor() {
  const { id } = useParams({ from: '/admin/topics/$id' });
  const query = useQuery(topicsQuery);
  const topic = query.data?.find((item) => item.id === id);
  if (query.isPending) return <p role="status">Loading topic…</p>;
  if (query.isError)
    return (
      <p role="alert">
        Could not load topics.{' '}
        <Button onClick={() => void query.refetch()}>Retry</Button>
      </p>
    );
  if (!topic)
    return (
      <p>
        Topic not found. <Link to="/admin/topics">Back to topics</Link>
      </p>
    );
  return <TopicEditor key={id} topic={topic} />;
}

function TopicEditor({ topic }: { topic: Topic }) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState(topic.sources);
  const catalog = useQuery({
    queryKey: ['admin', 'source-catalog'],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/admin/topics/sources', { signal });
      if (!response.ok) throw new Error('Could not load sources');
      return sourceCatalogSchema.parse(await response.json());
    },
  });
  async function write(path: string, method: string, body?: unknown) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/topics/${topic.id}${path}`, {
        method,
        signal: AbortSignal.timeout(15_000),
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (!response.ok) throw new Error();
      const result: unknown = await response.json();
      if (method === 'DELETE') {
        client.setQueryData(
          topicsQuery.queryKey,
          topicSchema.array().parse(result),
        );
        await navigate({ to: '/admin/topics' });
      } else {
        const saved = topicSchema.parse(result);
        client.setQueryData(topicsQuery.queryKey, (old = []) =>
          old.map((item) => (item.id === saved.id ? saved : item)),
        );
        if (path) {
          setSelected(saved.sources);
          await client.invalidateQueries({
            queryKey: ['admin', 'source-catalog'],
          });
        }
        setMessage(
          path
            ? 'Source connections saved.'
            : 'Topic saved. Changes apply to new editions.',
        );
      }
      return true;
    } catch {
      setMessage(
        'Could not confirm the change. Reload to check saved settings before trying again.',
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label="Topic editor" className="grid max-w-4xl gap-4 p-0">
      <Link to="/admin/topics" className="text-sm underline">
        ← All topics
      </Link>
      <h2 className="m-0 font-sans text-xl font-semibold">{topic.name}</h2>
      <p role="status" className="m-0 text-sm" aria-live="polite">
        {message}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const lines = (name: string) =>
            String(data.get(name) ?? '')
              .split('\n')
              .map((value) => value.trim())
              .filter(Boolean);
          const parsed = topicUpdateSchema.safeParse({
            name: data.get('name'),
            description: data.get('description'),
            includeGuidance: data.get('includeGuidance'),
            excludeGuidance: data.get('excludeGuidance'),
            enabled: data.has('enabled'),
            storyBudget: Number(data.get('storyBudget')),
            postBudget: Number(data.get('postBudget')),
            relevancePolicy: {
              includeAny: lines('includeAny'),
              excludeAny: lines('excludeAny'),
            },
            accounts: lines('accounts').map((value) => value.replace(/^@/, '')),
            redditCommunities: lines('redditCommunities').map((value) =>
              value.replace(/^r\//i, ''),
            ),
          });
          if (!parsed.success) {
            setMessage(
              parsed.error.issues
                .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                .join(' · '),
            );
            return;
          }
          void write('', 'PUT', parsed.data);
        }}
      >
        <fieldset
          disabled={busy}
          className="m-0 grid min-w-0 gap-4 border-0 p-0"
        >
          <Card className="grid gap-4">
            <h3 className="m-0 font-sans text-base font-semibold">
              Basics & guidance
            </h3>
            <label className="grid gap-1 text-sm">
              Name
              <Input
                name="name"
                required
                maxLength={120}
                defaultValue={topic.name}
              />
            </label>
            <label className="grid gap-1 text-sm">
              Description
              <Textarea
                aria-label="Description"
                name="description"
                maxLength={2000}
                defaultValue={topic.description}
              />
            </label>
            <label className="grid gap-1 text-sm">
              Include guidance
              <Textarea
                aria-label="Include guidance"
                name="includeGuidance"
                maxLength={2000}
                defaultValue={topic.includeGuidance}
              />
            </label>
            <label className="grid gap-1 text-sm">
              Exclude guidance
              <Textarea
                aria-label="Exclude guidance"
                name="excludeGuidance"
                maxLength={2000}
                defaultValue={topic.excludeGuidance}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={topic.enabled}
              />
              Enabled
            </label>
          </Card>
          <Card className="grid gap-4">
            <h3 className="m-0 font-sans text-base font-semibold">Budgets</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Stories
                <Input
                  name="storyBudget"
                  type="number"
                  min={0}
                  max={20}
                  required
                  defaultValue={topic.storyBudget}
                />
              </label>
              <label className="grid gap-1 text-sm">
                Posts
                <Input
                  name="postBudget"
                  type="number"
                  min={0}
                  max={20}
                  required
                  defaultValue={topic.postBudget}
                />
              </label>
            </div>
          </Card>
          <Card className="grid gap-4">
            <h3 className="m-0 font-sans text-base font-semibold">
              Source filters
            </h3>
            <p className="m-0 text-sm text-[var(--secondary)]">
              One phrase per line. Exclusions take precedence; leave includes
              empty to allow all source candidates.
            </p>
            <label className="grid gap-1 text-sm">
              Include phrases
              <Textarea
                aria-label="Include phrases"
                name="includeAny"
                defaultValue={topic.relevancePolicy.includeAny.join('\n')}
              />
            </label>
            <label className="grid gap-1 text-sm">
              Exclude phrases
              <Textarea
                aria-label="Exclude phrases"
                name="excludeAny"
                defaultValue={topic.relevancePolicy.excludeAny.join('\n')}
              />
            </label>
          </Card>
          <Card className="grid gap-4">
            <h3 className="m-0 font-sans text-base font-semibold">
              Social discovery
            </h3>
            <label className="grid gap-1 text-sm">
              X accounts
              <Textarea
                aria-label="X accounts"
                name="accounts"
                defaultValue={topic.accounts.join('\n')}
              />
            </label>
            <p className="m-0 text-sm text-[var(--secondary)]">
              Up to 20 unique handles, one per line. @ is optional. These
              support secondary searches; saving does not start a search.
            </p>
            <label className="grid gap-1 text-sm">
              Reddit communities
              <Textarea
                aria-label="Reddit communities"
                name="redditCommunities"
                defaultValue={topic.redditCommunities.join('\n')}
              />
            </label>
            <p className="m-0 text-sm text-[var(--secondary)]">
              One per line, up to 20. Reddit collection is parked; these choices
              are saved for later.
            </p>
          </Card>
          <div>
            <Button type="submit">{busy ? 'Saving…' : 'Save topic'}</Button>
          </div>
        </fieldset>
      </form>
      <Card className="grid gap-4">
        <h3 className="m-0 font-sans text-base font-semibold">Sources</h3>
        <p className="m-0 text-sm text-[var(--secondary)]">
          Connections apply to incoming articles and new editions. Saved
          editions keep their stories.
        </p>
        {catalog.isPending && <p role="status">Loading sources…</p>}
        {catalog.isError && (
          <p role="alert">
            Could not load sources.{' '}
            <Button onClick={() => void catalog.refetch()}>
              Retry sources
            </Button>
          </p>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void write('/sources', 'PUT', { ids: selected });
          }}
        >
          <fieldset
            disabled={busy || !catalog.data}
            className="m-0 grid max-h-72 min-w-0 gap-2 overflow-y-auto border-0 p-0"
          >
            <legend className="sr-only">Connected sources</legend>
            {catalog.data?.map((source) => (
              <label key={source.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(source.id)}
                  onChange={(event) =>
                    setSelected((old) =>
                      event.target.checked
                        ? [...old, source.id]
                        : old.filter((id) => id !== source.id),
                    )
                  }
                />
                {source.name}
              </label>
            ))}
          </fieldset>
          <Button
            type="submit"
            className="mt-4"
            disabled={busy || !catalog.data}
          >
            Save sources
          </Button>
        </form>
        {(['feed', 'query'] as const).map((kind) => (
          <form
            key={kind}
            aria-label={kind === 'feed' ? 'Add feed' : 'Add news query'}
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget,
                data = new FormData(form);
              if (
                await write(
                  kind === 'feed' ? '/feeds' : '/queries',
                  'POST',
                  kind === 'feed'
                    ? { name: data.get('feedName'), url: data.get('feedUrl') }
                    : { query: data.get('query') },
                )
              )
                form.reset();
            }}
          >
            <fieldset
              disabled={busy || !catalog.data}
              className="m-0 grid min-w-0 gap-3 border-0 border-t border-solid border-[var(--border)] px-0 pt-4"
            >
              {kind === 'feed' ? (
                <>
                  <label className="grid gap-1 text-sm">
                    Feed name
                    <Input name="feedName" required maxLength={120} />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Feed URL
                    <Input
                      name="feedUrl"
                      required
                      type="url"
                      maxLength={2000}
                      placeholder="https://publisher.com/feed"
                    />
                  </label>
                </>
              ) : (
                <label className="grid gap-1 text-sm">
                  News query
                  <Input
                    name="query"
                    required
                    maxLength={100}
                    placeholder='"AI agents" OR "AI models"'
                  />
                </label>
              )}
              <p className="m-0 text-sm text-[var(--secondary)]">
                {kind === 'feed'
                  ? 'Public HTTPS RSS or Atom feed.'
                  : 'Google News English-language US coverage.'}{' '}
                Connecting saves immediately; collection starts within one
                minute.
              </p>
              <div>
                <Button type="submit" variant="ghost">
                  {kind === 'feed' ? 'Connect feed' : 'Connect news query'}
                </Button>
              </div>
            </fieldset>
          </form>
        ))}
      </Card>
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-sm text-[var(--secondary)]">
          Deleting preserves saved editions and shared sources.
        </p>
        <Dialog.Root
          open={deleting}
          onOpenChange={(open) => {
            if (!busy) setDeleting(open);
          }}
        >
          <Dialog.Trigger asChild>
            <Button variant="ghost" disabled={busy}>
              Delete topic
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[var(--surface)] p-6 shadow-xl">
              <Dialog.Title className="mt-0 font-sans text-lg font-semibold">
                Delete {topic.name}?
              </Dialog.Title>
              <Dialog.Description className="text-sm">
                This removes the topic from future editions. Saved editions and
                shared sources are preserved.
              </Dialog.Description>
              <div className="flex flex-wrap gap-2">
                <Dialog.Close asChild>
                  <Button variant="ghost" disabled={busy}>
                    Keep topic
                  </Button>
                </Dialog.Close>
                <Button
                  disabled={busy}
                  onClick={() => void write('', 'DELETE')}
                >
                  Confirm deletion
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Card>
    </section>
  );
}
