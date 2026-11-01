import React from 'react';
import {
  sourceCatalogSchema,
  topicSchema,
  type SourceCatalog,
  type Topic,
} from '@digest/contracts';
export function TopicSources({
  topic,
  onSaved,
  onClose,
}: {
  topic: Topic;
  onSaved: (topic: Topic) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = React.useState('');
  const [feedName, setFeedName] = React.useState('');
  const [feedUrl, setFeedUrl] = React.useState('');
  const [catalog, setCatalog] = React.useState<SourceCatalog | null>(null);
  const [selected, setSelected] = React.useState(topic.sources);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  React.useEffect(() => {
    fetch('/api/topics/sources')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setCatalog(sourceCatalogSchema.parse(data)))
      .catch(() => setMessage('Could not load sources. Close and try again.'));
  }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/topics/${topic.id}/sources`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected }),
      });
      if (!response.ok) throw new Error();
      onSaved(topicSchema.parse(await response.json()));
      setMessage(
        'Source connections saved. Incoming articles updated; create a new edition to use these sources.',
      );
    } catch {
      setMessage(
        'Could not save sources. Your selection is still here; try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function addFeed(event: React.FormEvent, search = false) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(
        `/api/topics/${topic.id}/${search ? 'queries' : 'feeds'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            search ? { query } : { name: feedName, url: feedUrl },
          ),
        },
      );
      if (!response.ok) {
        setMessage(
          response.status === 400
            ? search
              ? 'Use a news query of 1–100 characters without control characters. Catalog limit: 500 sources; topic limit: 100 connections.'
              : 'Use a public HTTPS RSS/Atom URL without credentials or a custom port. Catalog limit: 500 sources; topic limit: 100 connections.'
            : 'Could not connect feed. Your entries are still here; try again.',
        );
        return;
      }
      const saved = topicSchema.parse(await response.json());
      onSaved(saved);
      setSelected(saved.sources);
      setFeedName('');
      setFeedUrl('');
      setQuery('');
      const catalogResponse = await fetch('/api/topics/sources');
      if (!catalogResponse.ok) throw new Error();
      setCatalog(sourceCatalogSchema.parse(await catalogResponse.json()));
      setMessage(
        'Feed connected. Collection starts within one minute; check Source & run status for results. Existing feed URLs reuse their saved name and articles.',
      );
    } catch {
      setMessage(
        'Could not refresh feed connections. Close and reopen sources to check before retrying.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form aria-label={`Sources for ${topic.name}`} onSubmit={save}>
        <fieldset disabled={busy || !catalog}>
          <legend>Sources for {topic.name}</legend>
          <p>
            Choose from the connected source catalog. Existing collected
            articles become available immediately. Future collection is shared
            across topics. Phrase rules still filter new editions; saved
            editions keep their original stories.
          </p>
          {catalog?.map((source) => (
            <label key={source.id}>
              <input
                type="checkbox"
                checked={selected.includes(source.id)}
                onChange={(event) =>
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, source.id]
                      : current.filter((id) => id !== source.id),
                  )
                }
              />
              {source.name}{' '}
              <a href={source.url} target="_blank" rel="noreferrer">
                Feed
              </a>
            </label>
          ))}
          <p>
            Clear every checkbox to disconnect all sources. Query feeds appear
            by their Google News name. To change a query, connect its
            replacement and disconnect the old feed. Social accounts are not
            available yet.
          </p>
          <button type="submit">{busy ? 'Saving…' : 'Save sources'}</button>
        </fieldset>
        <button type="button" disabled={busy} onClick={onClose}>
          Close sources
        </button>
        <p role="status">{message}</p>
      </form>
      <form
        aria-label={`Add feed for ${topic.name}`}
        onSubmit={(event) => addFeed(event)}
      >
        <fieldset disabled={busy || !catalog}>
          <legend>Add RSS or Atom feed</legend>
          <p>
            Enter a publisher’s public HTTPS feed URL. Connecting saves
            immediately and reloads the saved source selection. New feeds are
            unverified until collection succeeds; empty or invalid feeds show an
            error in Source &amp; run status.
          </p>
          <label>
            Feed name
            <input
              required
              maxLength={120}
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
            />
          </label>
          <label>
            Feed URL
            <input
              type="url"
              required
              maxLength={2000}
              placeholder="https://publisher.com/feed"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
            />
          </label>
          <button type="submit">{busy ? 'Connecting…' : 'Connect feed'}</button>
        </fieldset>
      </form>
      <form
        aria-label={`Add news query for ${topic.name}`}
        onSubmit={(event) => addFeed(event, true)}
      >
        <fieldset disabled={busy || !catalog}>
          <legend>Discover news by query</legend>
          <p>
            Google News RSS searches English-language US coverage. Use a phrase
            or search operators such as OR and site:. Results use Google’s
            article links and remain broad candidates, filtered by your topic’s
            phrase rules in new editions. Connecting saves immediately and
            reloads saved selections; collection starts within one minute.
          </p>
          <label>
            News query
            <input
              required
              maxLength={100}
              placeholder='"AI agents" OR "AI models"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="submit">
            {busy ? 'Connecting…' : 'Connect news query'}
          </button>
        </fieldset>
      </form>
    </>
  );
}
