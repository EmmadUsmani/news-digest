import { decodeHTML } from 'entities';
import { type DefaultTreeAdapterMap, parseFragment, serialize } from 'parse5';

import { plainText } from '../domain/normalize';

/** Use publisher reporting sections; never navigation, scripts or HN comments. */
export function publisherExcerpt(html: string): string {
  // Article headers often contain the only page title. Retain that heading
  // so main-body scoping survives removal of author, date and header chrome.
  const titled = html.replace(
    /<header\b[^>]*>([\s\S]*?)<\/header\s*>/gi,
    (_header, body: string) =>
      /<h1\b[^>]*>[\s\S]*?<\/h1\s*>/i.exec(body)?.[0] ?? '',
  );
  const clean = titled.replace(
    /<(script|style|nav|aside|header|footer)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    '',
  );
  const article = /<article\b[^>]*>([\s\S]*?)<\/article\s*>/i.exec(clean)?.[1];
  if (!article) {
    const abstract = researchAbstract(clean);
    if (abstract) return abstract;
  }
  const main =
    /<main\b[^>]*>([\s\S]*?)<\/main\s*>/i.exec(clean)?.[1] ??
    landmarkReporting(clean);
  // Some publisher blogs use main instead of article. Require their page
  // heading and take only the reporting after it, excluding opening chrome.
  const reporting =
    article ??
    mediaWikiReporting(clean) ??
    microformatReporting(clean) ??
    wordpressReporting(clean) ??
    templateReporting(clean) ??
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

/** Publishers mark the article body with the microformats e-content property. */
function microformatReporting(html: string): string | undefined {
  if (!html.includes('e-content')) return undefined;
  const content = find(parseFragment(html), (node) =>
    node.attrs.some(
      (attr) =>
        attr.name === 'class' && attr.value.split(/\s+/).includes('e-content'),
    ),
  );
  return content ? serialize(content) : undefined;
}

/** Explicit article templates separate their prose body from related posts. */
function templateReporting(html: string): string | undefined {
  if (!html.includes('data-tpl')) return undefined;
  const article = find(parseFragment(html), (node) =>
    node.attrs.some(
      (attr) => attr.name === 'data-tpl' && attr.value === 'article',
    ),
  );
  if (!article || !find(article, (node) => node.tagName === 'h1'))
    return undefined;
  const body = find(
    article,
    (node) =>
      node.attrs.some((attr) => attr.name === 'id' && attr.value === 'body') &&
      node.attrs.some(
        (attr) =>
          attr.name === 'class' && attr.value.split(/\s+/).includes('prose'),
      ),
  );
  return body ? serialize(body) : undefined;
}

/** ARIA main landmarks carry the same reporting scope as native main. */
function landmarkReporting(html: string): string | undefined {
  if (!html.includes('role')) return undefined;
  const main = find(parseFragment(html), (node) =>
    node.attrs.some((attr) => attr.name === 'role' && attr.value === 'main'),
  );
  return main ? serialize(main) : undefined;
}

/** WordPress hentry scopes the article body separately from comments and links. */
function wordpressReporting(html: string): string | undefined {
  if (!html.includes('entry-content')) return undefined;
  const hasClass = (node: Element, name: string) =>
    node.attrs.some(
      (attr) => attr.name === 'class' && attr.value.split(/\s+/).includes(name),
    );
  const entry = find(parseFragment(html), (node) => hasClass(node, 'hentry'));
  if (
    !entry ||
    !find(
      entry,
      (node) =>
        ['h1', 'h2'].includes(node.tagName) && hasClass(node, 'entry-title'),
    )
  )
    return undefined;
  const body = find(entry, (node) => hasClass(node, 'entry-content'));
  return body ? serialize(body) : undefined;
}
