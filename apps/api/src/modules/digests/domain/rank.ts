export interface Candidate {
 id: string; title: string; url: string; excerpt: string; publishedAt: string;
 sources: string[]; points: number;
}
// Signals are deliberately transparent; editorial judgement and event clustering follow.
export function rank(candidates: Candidate[], start: Date, end: Date, budget: number) {
 if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end || !Number.isInteger(budget) || budget < 0 || budget > 20) throw new Error('Invalid ranking window or budget');
 const seen = new Set<string>();
 return candidates.filter(item => {
 const date = Date.parse(item.publishedAt);
 return date >= start.getTime() && date < end.getTime() && /^https?:\/\//.test(item.url) && !/\/betting\/|\b(odds|best bets|promo code|how to watch|where to watch)\b/i.test(item.url + ' ' + item.title);
 }).map(item => {
 const recency = Math.max(0, 1 - (end.getTime() - Date.parse(item.publishedAt)) / (end.getTime() - start.getTime()));
 const breadth = new Set(item.sources).size;
 const engagement = Math.min(10, Math.log2(1 + Math.max(0, Number.isFinite(item.points) ? item.points : 0)));
 const score = Math.round((recency * 10 + Math.max(0, breadth - 1) * 8 + engagement) * 100) / 100;
 return { id: item.id, title: item.title, url: item.url, excerpt: item.excerpt.slice(0, 600), publishedAt: item.publishedAt, sources: item.sources, score,
 reasons: [`Recency: ${(recency * 10).toFixed(1)}/10`, `Observed in ${breadth} source${breadth === 1 ? '' : 's'}`, `HN engagement: ${engagement.toFixed(1)}/10`] };
 }).sort((a,b) => b.score - a.score || a.id.localeCompare(b.id)).filter(item => {
 const key = item.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
 if (seen.has(key)) return false; seen.add(key); return true;
 }).slice(0,budget);
}
