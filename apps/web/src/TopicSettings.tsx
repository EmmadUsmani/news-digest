import {
  type ScheduleSettings,
  type Topic,
  topicSchema,
  topicUpdateSchema,
} from '@digest/contracts';
import React from 'react';

import { TopicSources } from './TopicSources';
export function TopicSettings({
  topics,
  onSaved,
  onReordered,
  defaults,
}: {
  defaults?: ScheduleSettings;
  topics: Topic[];
  onReordered: (topics: Topic[]) => void;
  onSaved: (topic: Topic) => void;
}) {
  const [deleting, setDeleting] = React.useState<Topic | null>(null);
  const [sourceTopic, setSourceTopic] = React.useState<Topic | null>(null);
  const [editing, setEditing] = React.useState<Topic | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/topics/${deleting.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      onReordered(topicSchema.array().parse(await response.json()));
      if (editing?.id === deleting.id) setEditing(null);
      if (sourceTopic?.id === deleting.id) setSourceTopic(null);
      setMessage(
        `Deleted ${deleting.name}. Saved editions and shared sources are preserved.`,
      );
      setDeleting(null);
    } catch {
      setMessage('Could not delete topic. Reload the page and try again.');
    } finally {
      setBusy(false);
    }
  }
  async function move(index: number, delta: number) {
    const ordered = [...topics];
    [ordered[index], ordered[index + delta]] = [
      ordered[index + delta],
      ordered[index],
    ];
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/topics/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ordered.map((topic) => topic.id) }),
      });
      if (!response.ok) throw new Error();
      onReordered(topicSchema.array().parse(await response.json()));
      setMessage('Topic order saved. New editions will use this order.');
    } catch {
      setMessage('Could not save topic order. Reload the page and try again.');
    } finally {
      setBusy(false);
    }
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const phrases = (key: string) =>
      String(data.get(key) ?? '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    const parsed = topicUpdateSchema.safeParse({
      accounts: phrases('accounts').map((handle) => handle.replace(/^@/, '')),
      name: data.get('name'),
      description: data.get('description'),
      includeGuidance: data.get('includeGuidance'),
      excludeGuidance: data.get('excludeGuidance'),
      enabled: data.has('enabled'),
      storyBudget: Number(data.get('storyBudget')),
      postBudget: Number(data.get('postBudget')),
      relevancePolicy: {
        includeAny: phrases('includeAny'),
        excludeAny: phrases('excludeAny'),
      },
    });
    if (!parsed.success) {
      setMessage(
        'Check the name, budgets (0–20), phrase rules, and X accounts (up to 20 unique handles, 1–15 letters, digits or underscores).',
      );
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(
        editing.id ? `/api/topics/${editing.id}` : '/api/topics',
        {
          method: editing.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        },
      );
      if (!response.ok) throw new Error();
      const saved = topicSchema.parse(await response.json());
      onSaved(saved);
      setEditing(null);
      setMessage(
        `Saved ${saved.name}. Create a new edition to use these settings.`,
      );
    } catch {
      setMessage(
        'Could not save topic settings. Your changes are still here; try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="topic-settings">
      <summary>Manage topics</summary>
      <p>
        Use the arrow buttons to set reading order. Changes apply to new
        editions. Saved editions keep their original selections. Disabling a
        topic hides incoming articles and excludes it from new editions;
        collection pauses when no enabled topic uses its sources.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setEditing({
            id: '',
            profileId: '',
            name: '',
            description: '',
            includeGuidance: '',
            excludeGuidance: '',
            enabled: true,
            position: topics.length,
            storyBudget: defaults?.storyBudget ?? 5,
            postBudget: defaults?.postBudget ?? 5,
            relevancePolicy: { includeAny: [], excludeAny: [] },
            sources: [],
            queries: [],
            accounts: [],
          });
          setMessage('');
        }}
      >
        Create topic
      </button>
      <ul>
        {topics.map((topic, index) => (
          <li key={topic.id}>
            <span>
              {topic.name} · {topic.enabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              type="button"
              aria-label={`Move ${topic.name} up`}
              disabled={busy || index === 0}
              onClick={() => void move(index, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`Move ${topic.name} down`}
              disabled={busy || index === topics.length - 1}
              onClick={() => void move(index, 1)}
            >
              ↓
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setEditing(topic);
                setMessage('');
              }}
            >
              Edit {topic.name}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setSourceTopic(topic);
                setEditing(null);
              }}
            >
              Sources for {topic.name}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setDeleting(topic);
                setMessage('');
              }}
            >
              Delete {topic.name}
            </button>
          </li>
        ))}
      </ul>
      {deleting && (
        <section aria-label={`Delete ${deleting.name}`}>
          <h3>Delete {deleting.name}?</h3>
          <p>
            This permanently removes the topic settings and source connections.
            Saved editions, shared sources and collected articles are preserved.
            You can disable the topic instead to keep its settings.
          </p>
          <button type="button" disabled={busy} onClick={() => void remove()}>
            {busy ? 'Deleting…' : 'Delete topic permanently'}
          </button>{' '}
          <button
            type="button"
            disabled={busy}
            onClick={() => setDeleting(null)}
          >
            Keep topic
          </button>
        </section>
      )}
      {sourceTopic && (
        <TopicSources
          key={sourceTopic.id}
          topic={sourceTopic}
          onSaved={onSaved}
          onClose={() => setSourceTopic(null)}
        />
      )}{' '}
      {editing && (
        <form
          key={editing.id}
          onSubmit={save}
          aria-label={editing.id ? `Edit ${editing.name}` : 'Create topic'}
        >
          <fieldset disabled={busy}>
            <legend>{editing.id ? 'Topic settings' : 'Create topic'}</legend>
            {!editing.id && (
              <p>
                New topics start without source connections. After saving, use
                Sources for this topic to connect sources from the catalog.
              </p>
            )}
            <label>
              Name
              <input
                name="name"
                defaultValue={editing.name}
                required
                maxLength={120}
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                defaultValue={editing.description}
                maxLength={2000}
              />
            </label>
            <label>
              <input
                name="enabled"
                type="checkbox"
                defaultChecked={editing.enabled}
              />{' '}
              Include this topic
            </label>
            <div className="budget-fields">
              <label>
                Story budget
                <input
                  name="storyBudget"
                  type="number"
                  min="0"
                  max="20"
                  required
                  defaultValue={editing.storyBudget}
                />
              </label>
              <label>
                Post budget
                <input
                  name="postBudget"
                  type="number"
                  min="0"
                  max="20"
                  required
                  defaultValue={editing.postBudget}
                />
              </label>
            </div>
            <p>
              Post budgets limit verified posts in new editions. Quiet windows
              can have fewer posts. AI editing selects from available verified
              posts when the budget allows.
            </p>
            <label>
              Include guidance
              <textarea
                name="includeGuidance"
                defaultValue={editing.includeGuidance}
                maxLength={2000}
              />
            </label>
            <label>
              Exclude guidance
              <textarea
                name="excludeGuidance"
                defaultValue={editing.excludeGuidance}
                maxLength={2000}
              />
            </label>
            <p>
              Guidance and descriptions inform AI selection. Non-AI selection
              uses the phrase rules below, matched against headlines and
              excerpts. Exclusions take precedence.
            </p>
            <label>
              Include phrases · one per line
              <textarea
                name="includeAny"
                defaultValue={editing.relevancePolicy.includeAny.join('\n')}
              />
            </label>
            <p>
              Leave include phrases empty to allow all candidates from this
              topic’s sources.
            </p>
            <label>
              Exclude phrases · one per line
              <textarea
                name="excludeAny"
                defaultValue={editing.relevancePolicy.excludeAny.join('\n')}
              />
            </label>
            <label>
              X accounts · one handle per line
              <textarea
                name="accounts"
                defaultValue={editing.accounts.join('\n')}
                aria-describedby="x-accounts-help"
              />
            </label>
            <p id="x-accounts-help">
              Up to 20 unique handles; an initial @ is optional. These accounts
              scope X searches when discovery runs. Automatic paid discovery is
              currently off. Saving does not fetch posts or start a search.
              Leave empty to disable X searches for this topic. Free link
              discovery still uses the topic’s connected sources.
            </p>
            <p>
              Use the Sources button after saving to manage feeds and news
              queries.
            </p>
            <button type="submit">
              {busy ? 'Saving…' : editing.id ? 'Save topic' : 'Create topic'}
            </button>{' '}
            <button type="button" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </fieldset>
        </form>
      )}
      <p role="status">{message}</p>
    </details>
  );
}
