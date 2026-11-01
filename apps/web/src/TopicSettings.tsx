import React from 'react';
import { topicSchema, topicUpdateSchema, type Topic } from '@digest/contracts';
export function TopicSettings({ topics, onSaved }: { topics: Topic[]; onSaved: (topic: Topic) => void }) {
 const [editing, setEditing] = React.useState<Topic | null>(null);
 const [busy, setBusy] = React.useState(false);
 const [message, setMessage] = React.useState('');
 async function save(event: React.FormEvent<HTMLFormElement>) {
 event.preventDefault();
 if (!editing) return;
 const data = new FormData(event.currentTarget);
 const phrases = (key: string) => String(data.get(key) ?? '').split('\n').map(s => s.trim()).filter(Boolean);
 const parsed = topicUpdateSchema.safeParse({ name: data.get('name'), description: data.get('description'), includeGuidance: data.get('includeGuidance'), excludeGuidance: data.get('excludeGuidance'), enabled: data.has('enabled'), storyBudget: Number(data.get('storyBudget')), postBudget: Number(data.get('postBudget')), relevancePolicy: { includeAny: phrases('includeAny'), excludeAny: phrases('excludeAny') } });
 if (!parsed.success) { setMessage('Check the name, budgets (0–20), and phrase rules (up to 100 lines of 80 characters).'); return; }
 setBusy(true); setMessage('');
 try {
 const response = await fetch(`/api/topics/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) });
 if (!response.ok) throw new Error();
 const saved = topicSchema.parse(await response.json());
 onSaved(saved); setEditing(null); setMessage(`Saved ${saved.name}. Create a new edition to use these settings.`);
 } catch { setMessage('Could not save topic settings. Your changes are still here; try again.'); }
 finally { setBusy(false); }
 }
 return <details className="topic-settings"><summary>Manage topics</summary><p>Changes apply to new editions. Saved editions keep their original selections. Disabling a topic hides incoming articles and excludes it from new editions; collection continues.</p><ul>{topics.map(topic => <li key={topic.id}><span>{topic.name} · {topic.enabled ? 'Enabled' : 'Disabled'}</span><button type="button" disabled={busy} onClick={() => { setEditing(topic); setMessage(''); }}>Edit {topic.name}</button></li>)}</ul>{editing && <form key={editing.id} onSubmit={save} aria-label={`Edit ${editing.name}`}><fieldset disabled={busy}><legend>Topic settings</legend><label>Name<input name="name" defaultValue={editing.name} required maxLength={120}/></label><label>Description<textarea name="description" defaultValue={editing.description} maxLength={2000}/></label><label><input name="enabled" type="checkbox" defaultChecked={editing.enabled}/> Include this topic</label><div className="budget-fields"><label>Story budget<input name="storyBudget" type="number" min="0" max="20" required defaultValue={editing.storyBudget}/></label><label>Post budget<input name="postBudget" type="number" min="0" max="20" required defaultValue={editing.postBudget}/></label></div><p>Post discovery is not connected yet. Post budgets are saved for future use.</p><label>Include guidance<textarea name="includeGuidance" defaultValue={editing.includeGuidance} maxLength={2000}/></label><label>Exclude guidance<textarea name="excludeGuidance" defaultValue={editing.excludeGuidance} maxLength={2000}/></label><p>Guidance and descriptions are editorial notes. Current selection uses the explicit phrase rules below, matched against headlines and excerpts. Exclusions take precedence.</p><label>Include phrases · one per line<textarea name="includeAny" defaultValue={editing.relevancePolicy.includeAny.join('\n')}/></label><p>Leave include phrases empty to allow all candidates from this topic’s sources.</p><label>Exclude phrases · one per line<textarea name="excludeAny" defaultValue={editing.relevancePolicy.excludeAny.join('\n')}/></label><p>Source connections, queries and accounts are not editable here yet.</p><button type="submit">{busy ? 'Saving…' : 'Save topic'}</button> <button type="button" onClick={() => setEditing(null)}>Cancel</button></fieldset></form>}<p role="status">{message}</p></details>;
}
