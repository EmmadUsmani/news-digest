export function canonicalUrl(value: string): string | null {
 try {
 const url = new URL(value);
 if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
 url.hash = '';
 for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
 url.searchParams.sort();
 return url.toString();
 } catch { return null; }
}
export function plainText(value: unknown, limit = 1500): string {
 return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
}
