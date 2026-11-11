// news-digest DB schema explorer (browser). Data: GET /api/schema (live
// introspection + docs/schema-meta.json). Layout: ELK (global from CDN).
/* global ELK */

const SVG = 'http://www.w3.org/2000/svg';
const ROW = 20;
const HEAD = 30;
const PAD_X = 10;
const $ = (id) => document.getElementById(id);

const state = {
  model: null,
  signature: '',
  mode: localStorage.getItem('schema.mode') || 'keys',
  hidden: new Set(JSON.parse(localStorage.getItem('schema.hidden') || '[]')),
  selected: null,
  query: '',
  view: { x: 20, y: 20, k: 1 },
  boxes: new Map(), // table -> {x,y,w,h}
  fetchedAt: 0,
};

// ---------- helpers ----------
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  for (const c of children.flat())
    if (c !== null && c !== undefined && c !== false)
      node.append(c instanceof Node ? c : String(c));
  return node;
}
function svg(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs))
    if (v !== undefined && v !== null) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}
const ctx = document.createElement('canvas').getContext('2d');
function textWidth(text, font) {
  ctx.font = font;
  return ctx.measureText(text).width;
}
const MONO = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
const TYPE = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
const TITLE = '600 12.5px ui-sans-serif, system-ui, sans-serif';
function shortType(type) {
  return type
    .replace('timestamp with time zone', 'timestamptz')
    .replace('timestamp without time zone', 'timestamp')
    .replace('character varying', 'varchar')
    .replace('double precision', 'float8');
}
function fmtCount(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}
function fmtBytes(n) {
  const units = ['B', 'kB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i ? 1 : 0)} ${units[i]}`;
}
const groupById = (id) => state.model.groups.find((g) => g.id === id);
const tableByName = (name) => state.model.tables.find((t) => t.name === name);

// Columns that participate in any relation (FK or metadata).
function relationColumns(name) {
  const cols = new Set();
  for (const r of state.model.relations) {
    if (r.from.table === name) r.from.columns.forEach((c) => cols.add(c));
    if (r.to.table === name) r.to.columns.forEach((c) => cols.add(c));
  }
  return cols;
}
function visibleRows(table) {
  if (state.mode === 'tables') return { rows: [], hidden: 0 };
  if (state.mode === 'all') return { rows: table.columns, hidden: 0 };
  const rel = relationColumns(table.name);
  const rows = table.columns.filter(
    (c) => c.pk || c.fk || c.unique || rel.has(c.name),
  );
  return { rows, hidden: table.columns.length - rows.length };
}
function tableSize(table) {
  const { rows, hidden } = visibleRows(table);
  let w =
    textWidth(table.name, TITLE) + PAD_X * 2 + 50; /* room for row count */
  for (const c of rows)
    w = Math.max(
      w,
      PAD_X * 2 +
        28 +
        textWidth(c.name, MONO) +
        14 +
        textWidth(shortType(c.type) + (c.nullable ? '?' : ''), TYPE),
    );
  const lines = rows.length + (hidden ? 1 : 0);
  return {
    width: Math.ceil(Math.min(Math.max(w, 150), 380)),
    height: HEAD + (lines ? lines * ROW + 6 : 0),
  };
}

// ---------- data ----------
async function load(force) {
  const res = await fetch('api/schema', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const model = await res.json();
  state.fetchedAt = Date.now();
  const signature = JSON.stringify([
    model.groups,
    model.tables.map((t) => [t.name, t.columns, t.note]),
    model.relations,
  ]);
  state.model = model;
  $('stamp').textContent =
    `${model.tables.length} tables · ${model.relations.filter((r) => r.kind === 'fk').length} FKs · ` +
    (model.generatedAt
      ? `live as of ${new Date(model.generatedAt).toLocaleTimeString()}`
      : 'schema structure');
  renderWarnings();
  renderLegend();
  if (force || signature !== state.signature) {
    state.signature = signature;
    await layout();
  }
  if (state.selected && !tableByName(state.selected)) select(null);
  else if (state.selected) renderPanel();
}

// ---------- layout + render ----------
async function layout() {
  const groups = state.model.groups.filter(
    (g) => !state.hidden.has(g.id) && g.tables.length,
  );
  const shown = new Set(groups.flatMap((g) => g.tables));
  const elk = new ELK();
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.spacing.nodeNode': '22',
      'elk.layered.spacing.nodeNodeBetweenLayers': '46',
      'elk.layered.spacing.edgeNodeBetweenLayers': '16',
      'elk.spacing.componentComponent': '36',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
    },
    children: groups.map((g) => ({
      id: `g:${g.id}`,
      layoutOptions: {
        'elk.padding': '[top=34,left=14,bottom=14,right=14]',
      },
      children: g.tables.map((name) => ({
        id: `t:${name}`,
        ...tableSize(tableByName(name)),
      })),
    })),
    // Edges point parent -> child so referenced tables sit to the left.
    edges: state.model.relations
      .filter(
        (r) =>
          shown.has(r.from.table) &&
          shown.has(r.to.table) &&
          r.from.table !== r.to.table,
      )
      .map((r) => ({
        id: r.id,
        sources: [`t:${r.to.table}`],
        targets: [`t:${r.from.table}`],
      })),
  };
  const result = await elk.layout(graph);
  draw(result);
  if (!state.laidOut) {
    state.laidOut = true;
    fit();
    const fromHash = decodeURIComponent(location.hash.replace(/^#table=/, ''));
    if (fromHash && tableByName(fromHash)) select(fromHash, true);
  }
}

function draw(result) {
  const vp = $('viewport');
  vp.replaceChildren();
  state.boxes.clear();
  const edgeLayer = svg('g');
  const groupLayer = svg('g');
  const tableLayer = svg('g');
  vp.append(groupLayer, edgeLayer, tableLayer);

  // ELK positions children relative to their parent, and edge points relative
  // to the edge's container: convert everything to absolute coordinates.
  const origin = new Map([['root', { x: 0, y: 0 }]]);
  for (const g of result.children ?? []) origin.set(g.id, { x: g.x, y: g.y });
  for (const g of result.children ?? []) {
    const group = groupById(g.id.slice(2));
    groupLayer.append(
      svg('rect', {
        class: 'group-box',
        x: g.x,
        y: g.y,
        width: g.width,
        height: g.height,
        rx: 10,
        fill: group.color + '12',
        stroke: group.color + '66',
      }),
      svg(
        'text',
        { class: 'group-label', x: g.x + 14, y: g.y + 21, fill: group.color },
        group.name.toUpperCase(),
      ),
    );
    for (const child of g.children ?? []) {
      const t = { ...child, x: g.x + child.x, y: g.y + child.y };
      const table = tableByName(t.id.slice(2));
      state.boxes.set(table.name, { x: t.x, y: t.y, w: t.width, h: t.height });
      tableLayer.append(drawTable(table, group, t));
    }
  }
  for (const e of result.edges ?? []) {
    const rel = state.model.relations.find((r) => r.id === e.id);
    const o = origin.get(e.container ?? 'root') ?? { x: 0, y: 0 };
    for (const s of e.sections ?? []) {
      const pts = [s.startPoint, ...(s.bendPoints ?? []), s.endPoint];
      const d = 'M' + pts.map((p) => `${p.x + o.x},${p.y + o.y}`).join(' L');
      const label =
        `${rel.from.table}.${rel.from.columns.join(',')} → ${rel.to.table}.${rel.to.columns.join(',')}` +
        (rel.kind === 'implicit' ? ' (no FK; from metadata)' : '') +
        (rel.onDelete ? ` · on delete ${rel.onDelete}` : '') +
        (rel.note ? `\n${rel.note}` : '');
      const path = svg('path', {
        class: `edge ${rel.kind}`,
        d,
        'data-id': rel.id,
        'marker-start': `url(#arrow-${rel.kind})`,
      });
      const hit = svg('path', { class: 'edge-hit', d, 'data-id': rel.id });
      hit.append(svg('title', {}, label));
      hit.addEventListener('pointerenter', () => path.classList.add('hot'));
      hit.addEventListener('pointerleave', () => {
        if (!relationIsActive(rel)) path.classList.remove('hot');
      });
      edgeLayer.append(path, hit);
    }
  }
  applyView();
  applyHighlight();
}

function drawTable(table, group, box) {
  const g = svg('g', {
    class: 'table',
    'data-table': table.name,
    transform: `translate(${box.x},${box.y})`,
  });
  g.append(
    svg('rect', {
      class: 'box',
      width: box.width,
      height: box.height,
      rx: 6,
    }),
    svg('path', {
      d: `M0,6 a6,6 0 0 1 6,-6 h${box.width - 12} a6,6 0 0 1 6,6 v${HEAD - 6} h-${box.width} z`,
      fill: group.color,
    }),
    svg('text', { class: 'title', x: PAD_X, y: 19 }, table.name),
    svg(
      'text',
      { class: 'count', x: box.width - PAD_X, y: 19, 'text-anchor': 'end' },
      Number.isFinite(table.rowEstimate) ? fmtCount(table.rowEstimate) : '',
    ),
  );
  const { rows, hidden } = visibleRows(table);
  const rel = relationColumns(table.name);
  rows.forEach((c, i) => {
    const y = HEAD + 4 + i * ROW + 14;
    const tag = c.pk
      ? 'PK'
      : c.fk
        ? 'FK'
        : c.unique
          ? 'UQ'
          : rel.has(c.name)
            ? '~'
            : '';
    const cls = c.pk ? 'pk' : c.fk ? 'fk' : c.unique ? 'uq' : 'rel';
    if (tag)
      g.append(
        svg(
          'text',
          { class: `tag ${cls}-text`, x: PAD_X, y: y - 1, fill: tagColor(cls) },
          tag,
        ),
      );
    g.append(
      svg('text', { class: 'col', x: PAD_X + 24, y }, c.name),
      svg(
        'text',
        { class: 'type', x: box.width - PAD_X, y, 'text-anchor': 'end' },
        shortType(c.type) + (c.nullable ? '?' : ''),
      ),
    );
  });
  if (hidden)
    g.append(
      svg(
        'text',
        { class: 'more', x: PAD_X + 24, y: HEAD + 4 + rows.length * ROW + 14 },
        `+ ${hidden} more column${hidden === 1 ? '' : 's'}`,
      ),
    );
  g.append(
    svg(
      'title',
      {},
      `${table.name}${Number.isFinite(table.rowEstimate) ? ` · ~${table.rowEstimate} rows` : ''}${table.note ? '\n' + table.note : ''}`,
    ),
  );
  g.addEventListener('click', (ev) => {
    ev.stopPropagation();
    select(table.name);
  });
  return g;
}
function tagColor(cls) {
  return { pk: '#b45309', fk: '#4338ca', uq: '#15803d', rel: '#9333ea' }[cls];
}

// ---------- selection / highlight ----------
function neighbours(name) {
  const set = new Set([name]);
  for (const r of state.model.relations) {
    if (r.from.table === name) set.add(r.to.table);
    if (r.to.table === name) set.add(r.from.table);
  }
  return set;
}
function relationIsActive(rel) {
  return (
    state.selected &&
    (rel.from.table === state.selected || rel.to.table === state.selected)
  );
}
function matches(table) {
  const q = state.query;
  if (!q) return false;
  return (
    table.name.includes(q) || table.columns.some((c) => c.name.includes(q))
  );
}
function applyHighlight() {
  const near = state.selected ? neighbours(state.selected) : null;
  const hits = state.query
    ? new Set(state.model.tables.filter(matches).map((t) => t.name))
    : null;
  for (const node of document.querySelectorAll('.table')) {
    const name = node.dataset.table;
    node.classList.toggle('selected', name === state.selected);
    node.classList.toggle('match', Boolean(hits?.has(name)));
    node.classList.toggle(
      'dim',
      Boolean((near && !near.has(name)) || (hits && !hits.has(name) && !near)),
    );
  }
  for (const path of document.querySelectorAll('path.edge')) {
    const rel = state.model.relations.find((r) => r.id === path.dataset.id);
    const active = relationIsActive(rel);
    path.classList.toggle('hot', Boolean(active));
    path.classList.toggle('dim', Boolean((near && !active) || (hits && !near)));
  }
  for (const label of document.querySelectorAll('.group-label, .group-box'))
    label.classList.toggle('dim', Boolean(near || hits));
}
function select(name, center) {
  state.selected = name;
  history.replaceState(
    null,
    '',
    name ? `#table=${encodeURIComponent(name)}` : location.pathname,
  );
  applyHighlight();
  renderPanel();
  if (name && center) centerOn(name);
}

function renderPanel() {
  const panel = $('panel');
  const table = state.selected && tableByName(state.selected);
  if (!table) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  const group = groupById(table.group);
  const link = (name) => el('a', { onclick: () => select(name, true) }, name);
  const outgoing = state.model.relations.filter(
    (r) => r.from.table === table.name,
  );
  const incoming = state.model.relations.filter(
    (r) => r.to.table === table.name,
  );
  const relItem = (r, other, mine, theirs) =>
    el(
      'li',
      {},
      el('code', {}, mine.join(', ') || '—'),
      ' → ',
      link(other),
      theirs.length ? el('code', {}, `.${theirs.join(',')}`) : '',
      r.kind === 'implicit'
        ? el('span', { class: 'muted' }, ' (no FK)')
        : r.onDelete
          ? el('span', { class: 'muted' }, ` on delete ${r.onDelete}`)
          : '',
      r.note ? el('div', { class: 'muted' }, r.note) : '',
    );
  panel.replaceChildren(
    ...[
      el('button', { class: 'close', onclick: () => select(null) }, '✕'),
      el('h2', {}, table.name),
      el(
        'span',
        { class: 'chip', style: `background:${group.color}` },
        group.name,
      ),
      table.note ? el('p', { class: 'note' }, table.note) : '',
      table.comment ? el('p', { class: 'note muted' }, table.comment) : '',
      el(
        'p',
        { class: 'muted' },
        Number.isFinite(table.rowEstimate) && Number.isFinite(table.sizeBytes)
          ? `~${table.rowEstimate.toLocaleString()} rows · ${fmtBytes(table.sizeBytes)} on disk · ${table.columns.length} columns`
          : `${table.columns.length} columns`,
      ),
      el('h4', {}, 'Columns'),
      el(
        'table',
        {},
        table.columns.map((c) =>
          el(
            'tr',
            {},
            el(
              'td',
              { class: 'flags' },
              c.pk ? el('span', { class: 'pk' }, 'PK') : '',
              c.fk ? el('span', { class: 'fk' }, 'FK') : '',
              c.unique ? el('span', { class: 'uq' }, 'UQ') : '',
            ),
            el(
              'td',
              { class: 'mono' },
              c.name,
              c.comment ? el('div', { class: 'muted' }, c.comment) : '',
            ),
            el(
              'td',
              { class: 'mono t' },
              shortType(c.type) + (c.nullable ? '?' : ''),
              c.default
                ? el('div', { class: 'muted' }, `default ${c.default}`)
                : '',
            ),
          ),
        ),
      ),
      outgoing.length ? el('h4', {}, 'References') : '',
      outgoing.length
        ? el(
            'ul',
            {},
            outgoing.map((r) =>
              relItem(r, r.to.table, r.from.columns, r.to.columns),
            ),
          )
        : '',
      incoming.length ? el('h4', {}, 'Referenced by') : '',
      incoming.length
        ? el(
            'ul',
            {},
            incoming.map((r) =>
              relItem(r, r.from.table, r.to.columns, r.from.columns),
            ),
          )
        : '',
      table.uniques.length ? el('h4', {}, 'Unique') : '',
      table.uniques.length
        ? el(
            'ul',
            {},
            table.uniques.map((u) =>
              el('li', {}, el('code', {}, u.join(', '))),
            ),
          )
        : '',
      (table.indexes ?? []).length ? el('h4', {}, 'Indexes') : '',
      (table.indexes ?? []).map((i) => el('pre', {}, i.definition)),
      (table.checks ?? []).length ? el('h4', {}, 'Checks') : '',
      (table.checks ?? []).map((c) => el('pre', {}, c)),
      (table.triggers ?? []).length ? el('h4', {}, 'Triggers') : '',
      (table.triggers ?? []).map((t) => el('pre', {}, t.definition)),
    ].flat(),
  );
}

// ---------- legend + warnings ----------
function renderLegend() {
  const legend = $('legend');
  legend.replaceChildren(
    ...[
      el('h3', {}, 'Domains'),
      state.model.groups.map((g) =>
        el(
          'label',
          {},
          el('input', {
            type: 'checkbox',
            ...(state.hidden.has(g.id) ? {} : { checked: '' }),
            onchange: (ev) => {
              if (ev.target.checked) state.hidden.delete(g.id);
              else state.hidden.add(g.id);
              localStorage.setItem(
                'schema.hidden',
                JSON.stringify([...state.hidden]),
              );
              void layout();
            },
          }),
          el('span', { class: 'swatch', style: `background:${g.color}` }),
          el(
            'span',
            {},
            `${g.name} `,
            el('span', { class: 'muted' }, `(${g.tables.length})`),
            g.description ? el('small', {}, g.description) : '',
          ),
        ),
      ),
      el('h3', {}, 'Key'),
      el(
        'div',
        { class: 'key' },
        el('span', { class: 'badge pk' }, 'PK'),
        'primary key',
      ),
      el(
        'div',
        { class: 'key' },
        el('span', { class: 'badge fk' }, 'FK'),
        'foreign key column',
      ),
      el(
        'div',
        { class: 'key' },
        el('span', { class: 'badge uq' }, 'UQ'),
        'unique',
      ),
      el(
        'div',
        { class: 'key' },
        el('span', { class: 'badge rel' }, '~'),
        'related without an FK',
      ),
      el('div', { class: 'key' }, el('code', {}, 'text?'), 'nullable column'),
      el('div', { class: 'key' }, '── foreign key (arrow → referenced table)'),
      el(
        'div',
        { class: 'key', style: 'color:#a855f7' },
        '- - relation from metadata (no FK)',
      ),
      state.model.generatedAt
        ? el('div', { class: 'key' }, 'Number in a header = estimated rows')
        : '',
      el('h3', {}, 'Source'),
      el(
        'small',
        {},
        state.model.generatedAt
          ? 'Live introspection of Postgres. Groups, notes and dashed relations come from '
          : 'Schema structure from Postgres. Groups and dashed relations come from ',
        el('code', {}, 'docs/schema-meta.json'),
        '.',
      ),
    ].flat(),
  );
}
function renderWarnings() {
  const warnings = state.model.warnings ?? [];
  const btn = $('warn');
  btn.hidden = !warnings.length;
  btn.textContent = `⚠ ${warnings.length} metadata warning${warnings.length === 1 ? '' : 's'}`;
  $('warnings').replaceChildren(
    el(
      'ul',
      {},
      warnings.map((w) => el('li', {}, w)),
    ),
  );
  if (!warnings.length) $('warnings').hidden = true;
}

// ---------- pan / zoom ----------
function applyView() {
  const { x, y, k } = state.view;
  $('viewport').setAttribute('transform', `translate(${x},${y}) scale(${k})`);
}
function bounds() {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const node of $('viewport').querySelectorAll('.group-box')) {
    const x = +node.getAttribute('x'),
      y = +node.getAttribute('y');
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + +node.getAttribute('width'));
    maxY = Math.max(maxY, y + +node.getAttribute('height'));
  }
  return { minX, minY, maxX, maxY };
}
function fit() {
  const b = bounds();
  if (!Number.isFinite(b.minX)) return;
  const rect = $('canvas').getBoundingClientRect();
  const k = Math.min(
    1.2,
    (rect.width - 40) / (b.maxX - b.minX),
    (rect.height - 40) / (b.maxY - b.minY),
  );
  state.view = {
    k,
    x: (rect.width - (b.maxX - b.minX) * k) / 2 - b.minX * k,
    y: (rect.height - (b.maxY - b.minY) * k) / 2 - b.minY * k,
  };
  applyView();
}
function centerOn(name) {
  const box = state.boxes.get(name);
  if (!box) return;
  const rect = $('canvas').getBoundingClientRect();
  const k = Math.max(state.view.k, 0.9);
  state.view = {
    k,
    x: rect.width / 2 - (box.x + box.w / 2) * k,
    y: rect.height / 2 - (box.y + box.h / 2) * k,
  };
  applyView();
}
function setupPanZoom() {
  const canvas = $('canvas');
  let drag = null;
  canvas.addEventListener('pointerdown', (ev) => {
    if (ev.target.closest('.table')) return;
    drag = {
      x: ev.clientX,
      y: ev.clientY,
      vx: state.view.x,
      vy: state.view.y,
      moved: false,
    };
    canvas.classList.add('dragging');
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    const dx = ev.clientX - drag.x,
      dy = ev.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    state.view.x = drag.vx + dx;
    state.view.y = drag.vy + dy;
    applyView();
  });
  canvas.addEventListener('pointerup', () => {
    if (drag && !drag.moved) select(null);
    drag = null;
    canvas.classList.remove('dragging');
  });
  canvas.addEventListener(
    'wheel',
    (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const px = ev.clientX - rect.left,
        py = ev.clientY - rect.top;
      const scale = Math.exp(-ev.deltaY * (ev.ctrlKey ? 0.01 : 0.0015));
      const k = Math.min(3, Math.max(0.15, state.view.k * scale));
      const f = k / state.view.k;
      state.view = {
        k,
        x: px - (px - state.view.x) * f,
        y: py - (py - state.view.y) * f,
      };
      applyView();
    },
    { passive: false },
  );
}

// ---------- controls ----------
function setupControls() {
  const modeButtons = [...document.querySelectorAll('#mode button')];
  const paint = () =>
    modeButtons.forEach((b) =>
      b.classList.toggle('on', b.dataset.mode === state.mode),
    );
  paint();
  for (const b of modeButtons)
    b.addEventListener('click', () => {
      state.mode = b.dataset.mode;
      localStorage.setItem('schema.mode', state.mode);
      paint();
      void layout();
    });
  $('fit').addEventListener('click', fit);
  $('warn').addEventListener('click', () => {
    $('warnings').hidden = !$('warnings').hidden;
  });
  const search = $('search');
  search.addEventListener('input', () => {
    state.query = search.value.trim().toLowerCase();
    applyHighlight();
  });
  search.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      const hit = state.model.tables.find(matches);
      if (hit) select(hit.name, true);
    }
    if (ev.key === 'Escape') {
      search.value = '';
      state.query = '';
      applyHighlight();
      search.blur();
    }
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.target instanceof HTMLInputElement) return;
    if (ev.key === '/') {
      ev.preventDefault();
      search.focus();
    } else if (ev.key === 'f' || ev.key === 'F') fit();
    else if (ev.key === 'Escape') select(null);
  });
  // Deep links: #table=<name> selects and centres a table.
  window.addEventListener('hashchange', () => {
    const name = decodeURIComponent(location.hash.replace(/^#table=/, ''));
    if (state.model && name && name !== state.selected && tableByName(name))
      select(name, true);
  });
  // Live: re-introspect when the tab regains focus (at most every 15s).
  window.addEventListener('focus', () => {
    if (Date.now() - state.fetchedAt > 15000) void load().catch(showError);
  });
}
function showError(error) {
  $('status').textContent = `Could not load the schema: ${error.message}`;
}

setupPanZoom();
setupControls();
load(true)
  .then(() => {
    $('status').textContent = '';
  })
  .catch(showError);
