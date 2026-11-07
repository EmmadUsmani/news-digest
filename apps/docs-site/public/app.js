// news-digest docs viewer. Renders docs/handbook Markdown in the browser:
// marked (GFM) + DOMPurify + Mermaid diagrams. Hash routes: #/01-app/02-stack,
// optionally with a heading: #/01-app/02-stack?h=tech-stack
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.es.mjs';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked@15/lib/marked.esm.js';
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
import elkLayouts from 'https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk@0/dist/mermaid-layout-elk.esm.min.mjs';

import {
  rankPages,
  rankSections,
  sectionsOf,
  slug,
  snippet,
} from './search.js';

const REPO = 'https://github.com/EmmadUsmani/news-digest/blob/main';
const BASE = 'docs/handbook';
const $ = (id) => document.getElementById(id);
const dark = matchMedia('(prefers-color-scheme: dark)').matches;
let tree = null;
let order = []; // flat page list for prev/next
let sections = null; // search index, loaded when the palette first opens

// ELK is the default layout engine: it routes edges and labels around nested
// boxes and titles far better than dagre. A diagram can opt out with
// `config: layout: dagre` frontmatter.
mermaid.registerLayoutLoaders(elkLayouts);
mermaid.initialize({
  startOnLoad: false,
  layout: 'elk',
  securityLevel: 'strict',
  theme: dark ? 'dark' : 'neutral',
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  flowchart: { curve: 'basis', htmlLabels: true },
});

// ```mermaid blocks become <pre class="mermaid"> for Mermaid to render.
marked.use({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      if ((lang || '').trim() === 'mermaid')
        return `<div class="diagram"><pre class="mermaid">${escaped}</pre></div>`;
      return `<pre><code class="lang-${(lang || '').replace(/\W/g, '')}">${escaped}</code></pre>`;
    },
  },
});

// ---------- routing ----------
const routeOf = (path) =>
  '#/' + path.replace(/README\.md$/, '').replace(/\.md$/, '');
function pathOf(hash) {
  const route = decodeURIComponent(hash.replace(/^#\/?/, '').split('?')[0]);
  if (!route) return 'README.md';
  if (route.endsWith('/')) return route + 'README.md';
  return route + '.md';
}

const anchorOf = (hash) =>
  new URLSearchParams(hash.split('?')[1] ?? '').get('h');

async function loadTree() {
  tree = await (await fetch('api/tree', { cache: 'no-store' })).json();
  order = [
    ...(tree.home ? [tree.home] : []),
    ...tree.sections.flatMap((s) => [
      ...(s.index ? [s.index] : []),
      ...s.pages,
    ]),
  ];
  renderSidebar();
}

function renderSidebar() {
  const current = pathOf(location.hash);
  const item = (page, label = page.title) => {
    const a = document.createElement('a');
    a.href = routeOf(page.path);
    a.textContent = label;
    if (page.path === current) a.className = 'active';
    return a;
  };
  const nav = $('sidebar');
  nav.replaceChildren();
  if (tree.home) nav.append(item(tree.home));
  for (const s of tree.sections) {
    const h = document.createElement('h3');
    h.textContent = s.title;
    nav.append(h);
    if (s.index) nav.append(item(s.index, 'Overview'));
    for (const p of s.pages) nav.append(item(p));
  }
}

// ---------- rendering ----------
async function render() {
  const path = pathOf(location.hash);
  const content = $('content');
  const res = await fetch(`api/page?path=${encodeURIComponent(path)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    content.innerHTML = `<h1>Not found</h1><p>No page at <code></code>.</p>`;
    content.querySelector('code').textContent = path;
    $('toc').replaceChildren();
    $('pager').replaceChildren();
    return;
  }
  const page = await res.json();
  content.innerHTML = DOMPurify.sanitize(marked.parse(page.markdown), {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
  });
  enhance(content, path);
  renderToc(content);
  renderPager(path, page.updated);
  renderSidebar();
  document.title = `${content.querySelector('h1')?.textContent ?? 'Docs'} · news-digest docs`;
  window.scrollTo(0, 0);
  $('sidebar').classList.remove('open');
  remember(path);
  try {
    await mermaid.run({ nodes: content.querySelectorAll('pre.mermaid') });
  } catch (error) {
    console.error(error);
  }
  // After diagrams render, so their height doesn't move the target.
  scrollToAnchor(anchorOf(location.hash));
  for (const d of content.querySelectorAll('.diagram')) {
    d.title = 'Click to enlarge';
    d.addEventListener('click', () => openDiagram(d.querySelector('svg')));
  }
}

// Full-size diagram viewer: natural size, drag to pan, wheel/buttons to zoom.
function openDiagram(source) {
  if (!source) return;
  const box = source.viewBox.baseVal;
  const rect = source.getBoundingClientRect();
  const natural = box && box.width ? box.width : rect.width;
  const naturalH = box && box.height ? box.height : rect.height;
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  const stage = document.createElement('div');
  stage.className = 'stage';
  const svg = source.cloneNode(true);
  svg.removeAttribute('style');
  stage.append(svg);
  const bar = document.createElement('div');
  bar.className = 'overlay-bar';
  const button = (label, fn) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.addEventListener('click', (ev) => {
      ev.stopPropagation();
      fn();
    });
    bar.append(b);
  };
  // Start fitted to the screen (never smaller than the inline view's scale).
  const stageW = innerWidth;
  const stageH = innerHeight - 52;
  let scale = Math.min(2.5, (stageW - 48) / natural, (stageH - 48) / naturalH);
  let x = (stageW - natural * scale) / 2;
  let y = (stageH - naturalH * scale) / 2;
  const apply = () => {
    svg.style.width = `${natural * scale}px`;
    svg.style.transform = `translate(${x}px, ${y}px)`;
  };
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (ev) => {
    if (ev.key === 'Escape') close();
  };
  button('−', () => {
    scale = Math.max(0.3, scale / 1.25);
    apply();
  });
  button('+', () => {
    scale = Math.min(6, scale * 1.25);
    apply();
  });
  button('Close ✕', close);
  let drag = null;
  stage.addEventListener('pointerdown', (ev) => {
    drag = { sx: ev.clientX - x, sy: ev.clientY - y };
    stage.setPointerCapture(ev.pointerId);
  });
  stage.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    x = ev.clientX - drag.sx;
    y = ev.clientY - drag.sy;
    apply();
  });
  stage.addEventListener('pointerup', () => (drag = null));
  stage.addEventListener(
    'wheel',
    (ev) => {
      ev.preventDefault();
      scale = Math.min(6, Math.max(0.3, scale * Math.exp(-ev.deltaY * 0.0015)));
      apply();
    },
    { passive: false },
  );
  overlay.append(bar, stage);
  document.body.append(overlay);
  document.addEventListener('keydown', onKey);
  apply();
}

function enhance(root, path) {
  // Heading anchors.
  const used = new Set();
  for (const h of root.querySelectorAll('h1, h2, h3, h4'))
    h.id = slug(h.textContent, used);
  // GitHub-style callouts: > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
  for (const q of root.querySelectorAll('blockquote')) {
    const first = q.querySelector('p');
    const m =
      first &&
      /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i.exec(first.textContent);
    if (!m) continue;
    q.classList.add('callout', m[1].toLowerCase());
    first.innerHTML = first.innerHTML.replace(
      /^\s*\[![A-Za-z]+\]\s*(<br>)?/,
      '',
    );
    const label = document.createElement('div');
    label.className = 'callout-label';
    label.textContent = m[1][0] + m[1].slice(1).toLowerCase();
    q.prepend(label);
  }
  // Links: handbook .md -> in-app routes; other repo files -> GitHub.
  const base = `http://repo/${BASE}/${path}`;
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (/^[a-z]+:/i.test(href)) {
      a.target = '_blank';
      a.rel = 'noopener';
      continue;
    }
    if (href.startsWith('#')) {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        document
          .getElementById(href.slice(1))
          ?.scrollIntoView({ behavior: 'smooth' });
      });
      continue;
    }
    const url = new URL(href, base);
    const inside = url.pathname.startsWith(`/${BASE}/`);
    const rel = url.pathname.slice(`/${BASE}/`.length);
    if (inside && (rel.endsWith('.md') || rel.endsWith('/') || rel === ''))
      a.href = routeOf(
        rel.endsWith('/') || rel === '' ? rel + 'README.md' : rel,
      );
    else {
      a.href = REPO + url.pathname + url.hash;
      a.target = '_blank';
      a.rel = 'noopener';
    }
  }
  // Images under docs/ are served by /files/.
  for (const img of root.querySelectorAll('img[src]')) {
    const src = img.getAttribute('src');
    if (/^[a-z]+:/i.test(src)) continue;
    const url = new URL(src, base);
    if (url.pathname.startsWith('/docs/'))
      img.src = 'files/' + url.pathname.slice('/docs/'.length);
  }
  // Wide tables scroll instead of overflowing.
  for (const t of root.querySelectorAll('table')) {
    const wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    t.replaceWith(wrap);
    wrap.append(t);
  }
}

function renderToc(root) {
  const toc = $('toc');
  toc.replaceChildren();
  const heads = [...root.querySelectorAll('h2, h3')];
  if (heads.length < 2) return;
  const title = document.createElement('div');
  title.className = 'toc-title';
  title.textContent = 'On this page';
  toc.append(title);
  for (const h of heads) {
    const a = document.createElement('a');
    a.textContent = h.textContent;
    a.className = h.tagName === 'H3' ? 'sub' : '';
    a.href = '#';
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      h.scrollIntoView({ behavior: 'smooth' });
    });
    toc.append(a);
  }
}

function renderPager(path, updated) {
  const i = order.findIndex((p) => p.path === path);
  const pager = $('pager');
  pager.replaceChildren();
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.append(updated ? `Updated ${updated} · ` : '');
  const edit = document.createElement('a');
  edit.href = `${REPO}/${BASE}/${path}`;
  edit.target = '_blank';
  edit.rel = 'noopener';
  edit.textContent = 'View source on GitHub';
  meta.append(edit);
  const nav = document.createElement('div');
  nav.className = 'prevnext';
  const link = (page, label) => {
    const a = document.createElement('a');
    a.href = routeOf(page.path);
    a.innerHTML = `<small>${label}</small>`;
    a.append(page.title);
    return a;
  };
  if (i > 0) nav.append(link(order[i - 1], 'Previous'));
  else nav.append(document.createElement('span'));
  if (i >= 0 && i < order.length - 1) nav.append(link(order[i + 1], 'Next'));
  pager.append(nav, meta);
}

// ---------- command palette (⌘K / Ctrl+K, or /) ----------
const TOOLS = [
  ['App', '../'],
  ['Grafana', '../grafana/'],
  ['Logs', '../logs/'],
  ['Metrics', '../metrics/'],
  ['Queues', '../queues/'],
  ['DB explorer', '../db/'],
  ['GitHub', 'https://github.com/EmmadUsmani/news-digest'],
].map(([title, href]) => ({ title, href }));
const RECENT = 'docs.recent';
let rows = []; // { el, go } for each option, in display order
let active = -1;

function recentPaths() {
  try {
    return JSON.parse(localStorage.getItem(RECENT) ?? '[]');
  } catch {
    return [];
  }
}
function remember(path) {
  const paths = [path, ...recentPaths().filter((p) => p !== path)];
  try {
    localStorage.setItem(RECENT, JSON.stringify(paths.slice(0, 5)));
  } catch {
    // Private mode or storage full: recents are a convenience only.
  }
}

function scrollToAnchor(anchor) {
  const heading = anchor && document.getElementById(anchor);
  if (!heading) return;
  heading.scrollIntoView({ block: 'start' });
  heading.classList.remove('flash');
  void heading.offsetWidth; // restart the animation
  heading.classList.add('flash');
}

function navigate(path, anchor) {
  const hash =
    routeOf(path) + (anchor ? `?h=${encodeURIComponent(anchor)}` : '');
  if (location.hash === hash) scrollToAnchor(anchor);
  else location.hash = hash;
}

async function loadSections() {
  if (sections) return;
  const pages = await (await fetch('api/pages', { cache: 'no-store' })).json();
  sections = pages.flatMap(sectionsOf);
}

function sectionTitleOf(path) {
  return tree.sections.find((s) => path.startsWith(`${s.dir}/`))?.title ?? '';
}

function option(title, detail, go, parts) {
  const el = document.createElement('div');
  el.className = 'option';
  el.setAttribute('role', 'option');
  const head = document.createElement('div');
  head.className = 'option-head';
  const strong = document.createElement('strong');
  strong.textContent = title;
  head.append(strong);
  if (detail) {
    const small = document.createElement('small');
    small.textContent = detail;
    head.append(small);
  }
  el.append(head);
  if (parts?.length) {
    const p = document.createElement('p');
    for (const part of parts) {
      if (!part.match) p.append(part.text);
      else {
        const mark = document.createElement('mark');
        mark.textContent = part.text;
        p.append(mark);
      }
    }
    el.append(p);
  }
  return { el, go };
}

const pageOption = (page) =>
  option(page.title, sectionTitleOf(page.path), () => navigate(page.path));
const toolOption = (tool) =>
  option(
    tool.title,
    tool.href.startsWith('http') ? 'opens a new tab' : '',
    () => {
      if (tool.href.startsWith('http'))
        window.open(tool.href, '_blank', 'noopener');
      else location.href = tool.href;
    },
  );
function sectionOption(section, query) {
  const top = section.heading === null || section.heading === section.pageTitle;
  return option(
    section.heading ?? section.pageTitle,
    top ? sectionTitleOf(section.path) : section.pageTitle,
    () => navigate(section.path, top ? null : section.anchor),
    snippet(section.text, query),
  );
}

function groupsFor(query) {
  const q = query.trim();
  if (!q) {
    const here = pathOf(location.hash);
    const recent = recentPaths()
      .filter((p) => p !== here)
      .map((p) => order.find((page) => page.path === p))
      .filter(Boolean);
    return [
      ['Recent', recent.map(pageOption)],
      ['Pages', order.map(pageOption)],
      ['Go to', TOOLS.map(toolOption)],
    ];
  }
  const perPage = new Map();
  const hits = rankSections(sections ?? [], q)
    .filter(({ section }) => {
      const seen = perPage.get(section.path) ?? 0;
      perPage.set(section.path, seen + 1);
      return seen < 3;
    })
    .slice(0, 8);
  return [
    ['Pages', rankPages(order, q).slice(0, 5).map(pageOption)],
    ['In the handbook', hits.map((h) => sectionOption(h.section, q))],
    ['Go to', rankPages(TOOLS, q).map(toolOption)],
  ];
}

function renderPalette() {
  const input = $('palette-input');
  const list = $('palette-list');
  list.replaceChildren();
  rows = [];
  for (const [label, options] of groupsFor(input.value)) {
    if (!options.length) continue;
    const group = document.createElement('div');
    group.setAttribute('role', 'group');
    const title = document.createElement('div');
    title.className = 'group-title';
    title.id = `palette-group-${rows.length}`;
    title.textContent = label;
    group.setAttribute('aria-labelledby', title.id);
    group.append(title);
    for (const row of options) {
      const i = rows.length;
      row.el.id = `palette-option-${i}`;
      row.el.addEventListener('pointermove', () => setActive(i, false));
      row.el.addEventListener('click', () => choose(i));
      group.append(row.el);
      rows.push(row);
    }
    list.append(group);
  }
  if (!rows.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    // Until the index arrives, an empty list means "not yet", not "none".
    empty.textContent = sections
      ? `No matches for “${input.value.trim()}”`
      : 'Loading the handbook…';
    list.append(empty);
  }
  setActive(rows.length ? 0 : -1);
}

function setActive(i, scroll = true) {
  if (i === active && rows[i]?.el.getAttribute('aria-selected') === 'true')
    return;
  rows[active]?.el.setAttribute('aria-selected', 'false');
  active = i;
  const row = rows[i];
  const input = $('palette-input');
  if (!row) {
    input.removeAttribute('aria-activedescendant');
    return;
  }
  row.el.setAttribute('aria-selected', 'true');
  input.setAttribute('aria-activedescendant', row.el.id);
  if (scroll) row.el.scrollIntoView({ block: 'nearest' });
}

function choose(i) {
  const row = rows[i];
  if (!row) return;
  $('palette').close();
  row.go();
}

function openPalette() {
  const dialog = $('palette');
  if (dialog.open) return;
  $('palette-input').value = '';
  renderPalette();
  dialog.showModal();
  $('palette-input').focus();
  if (!sections)
    loadSections()
      .then(() => dialog.open && renderPalette())
      .catch((error) => console.error('search index failed', error));
}

function setupPalette() {
  const dialog = $('palette');
  const input = $('palette-input');
  const mac = /Mac|iPhone|iPad/.test(navigator.userAgent);
  $('search-key').textContent = mac ? '⌘K' : 'Ctrl K';
  $('search').addEventListener('click', openPalette);
  input.addEventListener('input', renderPalette);
  input.addEventListener('keydown', (ev) => {
    const move = { ArrowDown: 1, ArrowUp: -1 }[ev.key];
    if (move && rows.length) {
      ev.preventDefault();
      setActive((active + move + rows.length) % rows.length);
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      choose(active);
    }
  });
  // A click on the backdrop lands on the dialog itself.
  dialog.addEventListener('click', (ev) => {
    if (ev.target === dialog) dialog.close();
  });
  document.addEventListener('keydown', (ev) => {
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      if (dialog.open) dialog.close();
      else openPalette();
      return;
    }
    const typing = ev.target.closest?.('input, textarea, [contenteditable]');
    if (ev.key === '/' && !typing && !dialog.open) {
      ev.preventDefault();
      openPalette();
    }
  });
}

// ---------- boot ----------
function setup() {
  $('menu').addEventListener('click', () =>
    $('sidebar').classList.toggle('open'),
  );
  setupPalette();
  window.addEventListener('hashchange', () => void render());
}

setup();
loadTree()
  .then(render)
  .catch((error) => {
    $('content').textContent = `Could not load docs: ${error.message}`;
  });
