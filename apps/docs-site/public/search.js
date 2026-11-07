// Handbook search, shared by the browser (app.js) and the tests.
// Pages are split at their h1–h4 headings into sections; a query matches a
// section when every word starts a word in its heading, text or page title.

/**
 * @typedef {{ path: string, title: string, markdown: string }} SourcePage
 * @typedef {{ path: string, pageTitle: string, heading: string | null,
 *   anchor: string | null, text: string }} Section
 * @typedef {{ section: Section, score: number }} Hit
 */

/** Heading anchor, as set on rendered headings. `used` makes repeats unique. */
export function slug(text, used) {
  let s = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  while (used.has(s)) s += '-';
  used.add(s);
  return s;
}

/** Lower case without accents, so "Café" matches "cafe". */
export const fold = (text) =>
  text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Inline Markdown to the text a reader sees. */
function inline(markdown) {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*~]|(^|\s)_+|_+(?=\s|$)|\\(?=\S)/g, '$1')
    .trim();
}

/** Body Markdown to searchable plain text. */
function plain(markdown) {
  return inline(
    markdown
      .replace(/^\s*>\s?\[![A-Za-z]+\]/gm, '')
      .replace(/^\s*([>|-]|\d+\.|```\w*)\s?/gm, ' ')
      .replace(/\|/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** @param {SourcePage} page @returns {Section[]} */
export function sectionsOf(page) {
  /** @type {Section[]} */
  const sections = [];
  const used = new Set();
  let heading = null;
  let anchor = null;
  let body = [];
  let fence = null;
  const flush = () => {
    const text = plain(body.join('\n'));
    if (heading !== null || text)
      sections.push({
        path: page.path,
        pageTitle: page.title,
        heading,
        anchor,
        text,
      });
    body = [];
  };
  for (const line of page.markdown.split('\n')) {
    const marker = /^\s*(```|~~~)(\w*)/.exec(line);
    if (fence) {
      if (marker && marker[1] === fence.mark) fence = null;
      else if (fence.lang !== 'mermaid') body.push(line);
      continue;
    }
    if (marker) {
      fence = { mark: marker[1], lang: marker[2] };
      continue;
    }
    const h = /^(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!h) {
      body.push(line);
      continue;
    }
    flush();
    heading = inline(h[2]);
    anchor = slug(heading, used);
  }
  flush();
  return sections;
}

const escape = (term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const words = (query) => fold(query).split(/\s+/).filter(Boolean);
const startsWord = (term) =>
  new RegExp(`(^|[^\\p{L}\\p{N}])${escape(term)}`, 'u');
const count = (term, text) =>
  [...text.matchAll(new RegExp(term.source, 'gu'))].length;

/**
 * Sections where every query word starts a word. Headings outrank body text;
 * the page title can supply a word but adds little, so the best section of a
 * page wins rather than every section of a matching page.
 * @param {Section[]} sections @param {string} query @returns {Hit[]}
 */
export function rankSections(sections, query) {
  const terms = words(query).map(startsWord);
  if (!terms.length) return [];
  /** @type {Hit[]} */
  const hits = [];
  for (const section of sections) {
    const heading = fold(section.heading ?? '');
    const text = fold(section.text);
    const title = fold(section.pageTitle);
    let score = 0;
    for (const term of terms) {
      if (term.test(heading)) score += 5;
      else if (term.test(text))
        // Ties go to the section that uses the word more (up to 3 times).
        score += 2 + 0.1 * Math.min(3, count(term, text));
      else if (term.test(title)) score += 0.5;
      else {
        score = 0;
        break;
      }
    }
    if (score) hits.push({ section, score });
  }
  return hits.sort((a, b) => b.score - a.score);
}

/**
 * Pages whose title matches every word (start of word), best first.
 * @template {{ title: string }} P @param {P[]} pages @param {string} query
 */
export function rankPages(pages, query) {
  const terms = words(query).map(startsWord);
  if (!terms.length) return [];
  return pages.filter((p) => terms.every((t) => t.test(fold(p.title))));
}

/**
 * A short excerpt around the first matched word, split into plain and
 * matched parts so callers can render matches without HTML.
 * @param {string} text @param {string} query @param {number} [width]
 * @returns {{ text: string, match: boolean }[]}
 */
export function snippet(text, query, width = 110) {
  const terms = words(query);
  const folded = fold(text);
  let at = -1;
  for (const term of terms) {
    const m = startsWord(term).exec(folded);
    if (m && (at < 0 || m.index < at)) at = m.index + m[1].length;
  }
  if (at < 0) at = 0;
  let start = Math.max(0, at - 30);
  if (start > 0) start = text.indexOf(' ', start) + 1 || start;
  let end = Math.min(text.length, start + width);
  if (end < text.length) end = text.lastIndexOf(' ', end) || end;
  const piece = text.slice(start, end);
  const lowered = fold(piece);
  const marks = new Array(piece.length).fill(false);
  for (const term of terms) {
    const re = new RegExp(startsWord(term).source, 'gu');
    for (const m of lowered.matchAll(re)) {
      const from = m.index + m[1].length;
      for (let i = from; i < from + term.length && i < piece.length; i++)
        marks[i] = true;
    }
  }
  /** @type {{ text: string, match: boolean }[]} */
  const parts = [];
  for (let i = 0; i < piece.length; i++) {
    const last = parts[parts.length - 1];
    if (last?.match === marks[i]) last.text += piece[i];
    else parts.push({ text: piece[i], match: marks[i] });
  }
  if (start > 0) parts.unshift({ text: '…', match: false });
  if (end < text.length) parts.push({ text: '…', match: false });
  return parts;
}
