import { decodeHTML } from 'entities';
import { type DefaultTreeAdapterMap, parseFragment, serialize } from 'parse5';

import { plainText } from '../domain/normalize';

/** Use publisher reporting sections; never navigation, scripts or HN comments. */
export function publisherExcerpt(html: string): string {
  const clean = html.replace(
    /<(script|style|nav|aside|header|footer)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    '',
  );
  const article = /<article\b[^>]*>([\s\S]*?)<\/article\s*>/i.exec(clean)?.[1];
  if (!article) {
    const abstract = researchAbstract(clean);
    if (abstract) return abstract;
  }
  const main = /<main\b[^>]*>([\s\S]*?)<\/main\s*>/i.exec(clean)?.[1];
  // Some publisher blogs use main instead of article. Require their page
  // heading and take only the reporting after it, excluding opening chrome.
  const reporting =
    article ??
    mediaWikiReporting(clean) ??
    (main && /<h1\b[^>]*>[\s\S]*?<\/h1\s*>([\s\S]*)/i.exec(main)?.[1]);
  if (!reporting) return '';
  const paragraphs = [...reporting.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)]
    .map((match) => plainText(decodeHTML(match[1])))
    .filter((text) => text.length >= 60 && !/^https?:\/\/\S+$/i.test(text));
  return plainText(paragraphs.join(' '));
}

/** MediaWiki exposes its prose separately from navigation and infoboxes. */
function mediaWikiReporting(html: string): string | undefined {
  if (!html.includes('mw-parser-output')) return undefined;
  const content = find(parseFragment(html), (node) =>
    node.attrs.some(
      (attr) => attr.name === 'id' && attr.value === 'mw-content-text',
    ),
  );
  if (!content) return undefined;
  const prose = find(content, (node) =>
    node.attrs.some(
      (attr) =>
        attr.name === 'class' &&
        attr.value.split(/\s+/).includes('mw-parser-output'),
    ),
  );
  if (!prose) return undefined;
  function prune(node: Node): void {
    if (!('childNodes' in node)) return;
    node.childNodes = node.childNodes.filter(
      (child) =>
        !('tagName' in child) ||
        ![
          'table',
          'sup',
          'style',
          'script',
          'nav',
          'aside',
          'header',
          'footer',
        ].includes(child.tagName),
    );
    node.childNodes.forEach(prune);
  }
  prune(prose);
  return serialize(prose);
}

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
function find(
  node: Node,
  matches: (element: Element) => boolean,
): Element | undefined {
  if ('tagName' in node && matches(node)) return node;
  if ('childNodes' in node) {
    for (const child of node.childNodes) {
      const found = find(child, matches);
      if (found) return found;
    }
  }
  return undefined;
}

/** Research pages expose their evidence in a named abstract, not site footers. */
function researchAbstract(html: string): string {
  if (!html.includes('abstract')) return '';
  const abstract = find(
    parseFragment(html),
    (node) =>
      (node.tagName === 'blockquote' &&
        node.attrs.some(
          (attr) =>
            attr.name === 'class' &&
            attr.value.split(/\s+/).includes('abstract'),
        )) ||
      (node.tagName === 'section' &&
        node.attrs.some(
          (attr) => attr.name === 'id' && attr.value === 'abstract',
        )),
  );
  if (!abstract) return '';
  const body = serialize(abstract);
  const paragraphs = [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)];
  const text =
    abstract.tagName === 'blockquote'
      ? body.replace(
          /<span\b[^>]*class=["']descriptor["'][^>]*>[\s\S]*?<\/span>/gi,
          '',
        )
      : paragraphs
          .map((match) => match[1])
          .filter((text) => plainText(decodeHTML(text)).length >= 60)
          .join(' ');
  const normalized = plainText(decodeHTML(text));
  return normalized.length >= 60 ? normalized : '';
}
