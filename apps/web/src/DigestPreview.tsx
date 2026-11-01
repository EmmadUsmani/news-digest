import React from 'react';
import { digestPreviewSchema, type DigestPreview as Preview } from '@digest/contracts';
export function DigestPreview() {
 const [preview, setPreview] = React.useState<Preview | null>(null);
 const [busy, setBusy] = React.useState(false);
 const [error, setError] = React.useState(false);
 const [loaded, setLoaded] = React.useState(false);
 React.useEffect(() => { fetch('/api/digest-previews/latest').then(async r => { if (!r.ok) throw new Error(); const data = await r.json(); setPreview(data ? digestPreviewSchema.parse(data) : null); }).catch(() => setError(true)).finally(() => setLoaded(true)); }, []);
 async function generate() {
 setBusy(true); setError(false);
 try {
 const end = new Date();
 const response = await fetch('/api/digest-previews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ windowStart: new Date(end.getTime() - 86400000).toISOString(), windowEnd: end.toISOString() }) });
 if (!response.ok) throw new Error();
 setPreview(digestPreviewSchema.parse(await response.json()));
 } catch { setError(true); } finally { setBusy(false); }
 }
 return <section className="digest-preview" aria-label="Ranked edition"><p className="eyebrow">YOUR RANKED EDITION</p><h2>A shorter reading list.</h2><p>Preliminary selection by recency, source coverage and Hacker News engagement. Publisher headlines and excerpts appear as supplied; editorial summaries and post selection are still to come.</p><button disabled={busy || !loaded} onClick={() => void generate()}>{busy ? 'Selecting stories…' : 'Create edition · last 24 hours'}</button>{error && <p role="alert">The edition could not be loaded or created. Please try again.</p>}{!preview && loaded && !error && <p>No edition yet. Create one from your collected articles.</p>}{preview && <><p className="period">{new Date(preview.windowStart).toLocaleString()} — {new Date(preview.windowEnd).toLocaleString()} · Saved edition · {preview.method !== 'signals-v1' ? 'Topic phrase filtering' : 'Original ranking'}</p>{preview.topics.map(topic => <article className="digest-topic" key={topic.id}><h3>{topic.name}</h3><p className="selection-count">{topic.stories.length} selected from {topic.candidateCount} candidates examined{topic.relevanceRejectedCount !== undefined && <> · {topic.relevanceRejectedCount} filtered by topic rules</>}{topic.qualityRejections !== undefined && <> · {topic.qualityRejections.length} filtered by quality rules</>}</p>{!!topic.qualityRejections?.length && <details className="omissions"><summary>Why omitted · {topic.qualityRejections.length} candidates</summary><ul>{topic.qualityRejections.map(item => <li key={item.id}><span>{item.title}</span> — {item.reason}</li>)}</ul></details>}{topic.stories.length === 0 && <p>No qualifying stories in this window. Nothing added to fill the space.</p>}<ol>{topic.stories.map(story => <li key={story.id}><a href={story.url} target="_blank" rel="noreferrer">{story.title}</a>{story.excerpt && <p className="excerpt">{story.excerpt}</p>}<p className="byline">{story.sources.join(' · ')} · <time dateTime={story.publishedAt}>{new Date(story.publishedAt).toLocaleString()}</time></p><details><summary>Why selected · score {story.score}</summary><ul>{story.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></details></li>)}</ol></article>)}</>}</section>;
}
