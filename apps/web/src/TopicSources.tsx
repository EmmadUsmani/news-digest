import React from 'react';
import { sourceCatalogSchema, topicSchema, type SourceCatalog, type Topic } from '@digest/contracts';
export function TopicSources({ topic, onSaved, onClose }: { topic: Topic; onSaved: (topic: Topic) => void; onClose: () => void }) {
 const [catalog, setCatalog] = React.useState<SourceCatalog | null>(null);
 const [selected, setSelected] = React.useState(topic.sources);
 const [busy, setBusy] = React.useState(false);
 const [message, setMessage] = React.useState('');
 React.useEffect(() => { fetch('/api/topics/sources').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => setCatalog(sourceCatalogSchema.parse(data))).catch(() => setMessage('Could not load sources. Close and try again.')); }, []);
 async function save(event: React.FormEvent) {
 event.preventDefault(); setBusy(true); setMessage('');
 try {
 const response = await fetch(`/api/topics/${topic.id}/sources`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selected }) });
 if (!response.ok) throw new Error();
 onSaved(topicSchema.parse(await response.json())); setMessage('Source connections saved. Incoming articles updated; create a new edition to use these sources.');
 } catch { setMessage('Could not save sources. Your selection is still here; try again.'); }
 finally { setBusy(false); }
 }
 return <form aria-label={`Sources for ${topic.name}`} onSubmit={save}><fieldset disabled={busy || !catalog}><legend>Sources for {topic.name}</legend><p>Choose from the connected source catalog. Existing collected articles become available immediately. Future collection is shared across topics. Phrase rules still filter new editions; saved editions keep their original stories.</p>{catalog?.map(source => <label key={source.id}><input type="checkbox" checked={selected.includes(source.id)} onChange={event => setSelected(current => event.target.checked ? [...current, source.id] : current.filter(id => id !== source.id))}/>{source.name} <a href={source.url} target="_blank" rel="noreferrer">Feed</a></label>)}<p>Clear every checkbox to disconnect all sources. Custom feeds, search queries and social accounts are not available yet.</p><button type="submit">{busy ? 'Saving…' : 'Save sources'}</button></fieldset><button type="button" disabled={busy} onClick={onClose}>Close sources</button><p role="status">{message}</p></form>;
}
