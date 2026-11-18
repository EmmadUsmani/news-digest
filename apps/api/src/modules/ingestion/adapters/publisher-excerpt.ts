import { decodeHTML } from 'entities';
import { type DefaultTreeAdapterMap, parseFragment, serialize } from 'parse5';

import { plainText } from '../domain/normalize';

/** Use publisher reporting sections; never navigation, scripts or HN comments. */
export function publisherExcerpt(html: string): string {
  // Article headers often contain the only page title. Retain that heading
  // so main-body scoping survives removal of author, date and header chrome.
  const title = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(html)?.[1];
  const headerTitle =
    /<header\b[^>]*>\s*<strong\b[^>]*>([\s\S]*?)<\/strong\s*>/i.exec(html)?.[1];
  const matchingHeaderTitle = Boolean(
    title &&
    headerTitle &&
    plainText(decodeHTML(title)) === plainText(decodeHTML(headerTitle)),
  );
  const titled = html.replace(
    /<header\b[^>]*>([\s\S]*?)<\/header\s*>/gi,
    (_header, body: string) =>
      /<h1\b[^>]*>[\s\S]*?<\/h1\s*>/i.exec(body)?.[0] ?? '',
  );
  const clean = titled.replace(
    /<(script|style|nav|aside|header|footer)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    '',
  );
  const release = releaseNotes(clean);
  if (release) return release;
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
  // A matching header/document title also identifies a separately scoped main.
  const reporting =
    discourseReporting(clean) ??
    article ??
    mediaWikiReporting(clean) ??
    microformatReporting(clean) ??
    wordpressReporting(clean) ??
    templateReporting(clean) ??
    asciiDocReporting(clean, title) ??
    titledColumnReporting(clean, title) ??
    (main &&
      (/<h1\b[^>]*>[\s\S]*?<\/h1\s*>([\s\S]*)/i.exec(main)?.[1] ??
        (matchingHeaderTitle ? main : matchingMainHeading(main, title))));
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

/** GitHub release bodies contain changelog lists rather than article prose. */
function releaseNotes(html: string): string {
  if (!html.includes('body-content')) return '';
  const main = find(parseFragment(html), (node) => node.tagName === 'main');
  if (!main || !find(main, (node) => node.tagName === 'h1')) return '';
  const body = find(
    main,
    (node) =>
      node.attrs.some(
        (attr) =>
          attr.name === 'data-test-selector' && attr.value === 'body-content',
      ) &&
      node.attrs.some(
        (attr) =>
          attr.name === 'class' &&
          attr.value.split(/\s+/).includes('markdown-body'),
      ),
  );
  if (!body) return '';
  const blocks: string[] = [];
  function collect(node: Node): void {
    if (!('childNodes' in node)) return;
    if ('tagName' in node && ['p', 'li'].includes(node.tagName)) {
      const text = plainText(decodeHTML(serialize(node)));
      if (text.length >= 60 && !/^https?:\/\/\S+$/i.test(text))
        blocks.push(text);
      return;
    }
    node.childNodes.forEach(collect);
  }
  collect(body);
  return plainText(blocks.join(' '));
}

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

/** Discourse exposes the opening announcement separately from reader replies. */
function discourseReporting(html: string): string | undefined {
  if (!html.includes('crawler-post')) return undefined;
  const opening = find(
    parseFragment(html),
    (node) =>
      node.attrs.some(
        (attr) => attr.name === 'id' && attr.value === 'post_1',
      ) &&
      node.attrs.some(
        (attr) =>
          attr.name === 'class' &&
          attr.value.split(/\s+/).includes('crawler-post'),
      ),
  );
  if (!opening) return undefined;
  const body = find(
    opening,
    (node) =>
      node.attrs.some(
        (attr) => attr.name === 'itemprop' && attr.value === 'text',
      ) &&
      node.attrs.some(
        (attr) =>
          attr.name === 'class' && attr.value.split(/\s+/).includes('post'),
      ),
  );
  return body ? serialize(body) : undefined;
}

/** AsciiDoc separates its document header, content and footer by stable IDs. */
function asciiDocReporting(html: string, title?: string): string | undefined {
  if (!title || !html.includes('AsciiDoc')) return undefined;
  const root = parseFragment(html);
  const attr = (node: Element, name: string) =>
    node.attrs.find((entry) => entry.name === name)?.value;
  const generator = find(
    root,
    (node) =>
      node.tagName === 'meta' &&
      attr(node, 'name') === 'generator' &&
      /^AsciiDoc(?:tor)?(?:\s|$)/.test(attr(node, 'content') ?? ''),
  );
  const header = find(
    root,
    (node) => node.tagName === 'div' && attr(node, 'id') === 'header',
  );
  const heading = header && find(header, (node) => node.tagName === 'h1');
  if (
    !generator ||
    !heading ||
    plainText(decodeHTML(serialize(heading))) !== plainText(decodeHTML(title))
  )
    return undefined;
  const content = find(
    root,
    (node) => node.tagName === 'div' && attr(node, 'id') === 'content',
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
  if (!/\bentry(?:-content)?\b/.test(html)) return undefined;
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
        ['h1', 'h2'].includes(node.tagName) &&
        (hasClass(node, 'entry-title') ||
          Boolean(
            find(
              node,
              (child) =>
                child.tagName === 'a' &&
                child.attrs.some(
                  (attr) =>
                    attr.name === 'rel' &&
                    attr.value.split(/\s+/).includes('bookmark'),
                ),
            ),
          )),
    )
  )
    return undefined;
  const body =
    find(entry, (node) => hasClass(node, 'entry-content')) ??
    find(entry, (node) => hasClass(node, 'entry'));
  return body ? serialize(body) : undefined;
}

/** Lower-level page headings need a matching document title to identify prose. */
function matchingMainHeading(
  main: string,
  title: string | undefined,
): string | undefined {
  if (!title) return undefined;
  const heading = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1\s*>([\s\S]*)/i.exec(main);
  if (!heading) return undefined;
  const text = plainText(decodeHTML(heading[2]));
  const documentTitle = plainText(decodeHTML(title));
  return text.length >= 12 &&
    (documentTitle === text ||
      documentTitle.startsWith(`${text} - `) ||
      documentTitle.startsWith(`${text} | `))
    ? heading[3]
    : undefined;
}

/** Older blogs use a title-matched column rather than semantic article tags. */
function titledColumnReporting(
  html: string,
  title?: string,
): string | undefined {
  if (!title) return undefined;
  const documentTitle = plainText(decodeHTML(title));
  const column = find(
    parseFragment(html),
    (node) =>
      node.tagName === 'div' &&
      node.childNodes.some(
        (child) =>
          'tagName' in child &&
          child.tagName === 'h1' &&
          plainText(decodeHTML(serialize(child))) === documentTitle,
      ),
  );
  if (!column) return undefined;
  const paragraphs: string[] = [];
  let started = false;
  for (const child of column.childNodes) {
    if (!('tagName' in child)) continue;
    if (!started) {
      started =
        child.tagName === 'h1' &&
        plainText(decodeHTML(serialize(child))) === documentTitle;
      continue;
    }
    // Stop at the next section or nested widget; never traverse sidebars.
    if (child.tagName !== 'p') break;
    paragraphs.push(`<p>${serialize(child)}</p>`);
  }
  return paragraphs.length ? paragraphs.join('') : undefined;
}
