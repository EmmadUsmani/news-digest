// news-digest docs viewer. Renders docs/handbook Markdown in the browser:
// marked (GFM) + DOMPurify + Mermaid diagrams. Hash routes: #/01-app/02-stack
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.es.mjs';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked@15/lib/marked.esm.js';
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const REPO = 'https://github.com/EmmadUsmani/news-digest/blob/main';
const BASE = 'docs/handbook';
const $ = (id) => document.getElementById(id);
const dark = matchMedia('(prefers-color-scheme: dark)').matches;
let tree = null;
let order = []; // flat page list for prev/next
let searchIndex = null;

mermaid.initialize({
  startOnLoad: false,
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
  const route = decodeURIComponent(hash.replace(/^#\/?/, ''));
  if (!route) return 'README.md';
  if (route.endsWith('/')) return route + 'README.md';
  return route + '.md';
}

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
  try {
    await mermaid.run({ nodes: content.querySelectorAll('pre.mermaid') });
  } catch (error) {
    console.error(error);
  }
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

function slug(text, used) {
  let s = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  while (used.has(s)) s += '-';
  used.add(s);
  return s;
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

// ---------- search ----------
async function buildIndex() {
  if (searchIndex) return searchIndex;
  searchIndex = await Promise.all(
    order.map(async (p) => {
      const res = await fetch(`api/page?path=${encodeURIComponent(p.path)}`);
      const { markdown } = await res.json();
      return { ...p, text: markdown.replace(/```[\s\S]*?```/g, ' ') };
    }),
  );
  return searchIndex;
}
async function search(query) {
  const box = $('results');
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    box.hidden = true;
    return;
  }
  const index = await buildIndex();
  const hits = index
    .map((p) => {
      const lower = p.text.toLowerCase();
      const at = lower.indexOf(q);
      const inTitle = p.title.toLowerCase().includes(q);
      return at < 0 && !inTitle ? null : { p, at, score: inTitle ? 2 : 1 };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  box.replaceChildren();
  if (!hits.length) {
    box.textContent = 'No matches';
  }
  for (const { p, at } of hits) {
    const a = document.createElement('a');
    a.href = routeOf(p.path);
    const strong = document.createElement('strong');
    strong.textContent = p.title;
    const small = document.createElement('small');
    small.textContent =
      at >= 0
        ? '…' +
          p.text.slice(Math.max(0, at - 40), at + 80).replace(/\s+/g, ' ') +
          '…'
        : '';
    a.append(strong, small);
    a.addEventListener('click', () => {
      box.hidden = true;
      $('search').value = '';
    });
    box.append(a);
  }
  box.hidden = false;
}

// ---------- boot ----------
function setup() {
  $('menu').addEventListener('click', () =>
    $('sidebar').classList.toggle('open'),
  );
  const input = $('search');
  input.addEventListener('input', () => void search(input.value));
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      input.value = '';
      $('results').hidden = true;
      input.blur();
    }
    if (ev.key === 'Enter') $('results').querySelector('a')?.click();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === '/' && document.activeElement !== input) {
      ev.preventDefault();
      input.focus();
    }
  });
  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('.search')) $('results').hidden = true;
  });
  window.addEventListener('hashchange', () => void render());
}

setup();
loadTree()
  .then(render)
  .catch((error) => {
    $('content').textContent = `Could not load docs: ${error.message}`;
  });
