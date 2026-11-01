import { qualityRejection } from './quality';
import { clusterCandidates } from './cluster';
export interface Candidate {
 id: string; title: string; url: string; excerpt: string; publishedAt: string;
 sources: string[]; points: number;
}
// Signals are deliberately transparent; editorial judgement remains a separate step.
export function rank(candidates: Candidate[], start: Date, end: Date, budget: number) {
 if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end || !Number.isInteger(budget) || budget < 0 || budget > 20) throw new Error('Invalid ranking window or budget');
 const scored = candidates.filter(item => {
 const date = Date.parse(item.publishedAt);
 return date >= start.getTime() && date < end.getTime() && !qualityRejection(item);
 }).map(item => {
 const recency = Math.max(0, 1 - (end.getTime() - Date.parse(item.publishedAt)) / (end.getTime() - start.getTime()));
 const breadth = new Set(item.sources).size;
 const engagement = Math.min(10, Math.log2(1 + Math.max(0, Number.isFinite(item.points) ? item.points : 0)));
 // Feed/aggregator observations do not prove independent reporting.
 const score = Math.round((recency * 10 + engagement) * 100) / 100;
 return { id: item.id, title: item.title, url: item.url, excerpt: item.excerpt.slice(0, 600), publishedAt: item.publishedAt, sources: item.sources, score,
 reasons: [`Recency: ${(recency * 10).toFixed(1)}/10`, `Observed in ${breadth} source label${breadth === 1 ? '' : 's'} (independence unverified; no score bonus)`, `HN engagement: ${engagement.toFixed(1)}/10`] };
 }).sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));
 const byId = new Map(scored.map(item => [item.id, item]));
 return clusterCandidates(scored.map(item => ({ ...item, points: 0 }))).slice(0,budget).map(group => {
 const lead = byId.get(group[0].id)!;
 const sources = [...new Set(group.flatMap(item => item.sources))].sort();
 return { ...lead, sources, coverage: group.map(item => ({ id: item.id, title: item.title, url: item.url, sources: item.sources, publishedAt: item.publishedAt })),
 reasons: [...lead.reasons, `Headline cluster: ${group.length} article${group.length === 1 ? '' : 's'}; ${sources.length} observed source label${sources.length === 1 ? '' : 's'} (independence unverified); no extra score bonus`] };
 });
}
