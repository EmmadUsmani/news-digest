// Pure transform: catalog rows (from introspection) + optional metadata -> explorer model.
// No I/O here so it can be unit tested without a database.

export interface TableRow {
  name: string;
  comment: string | null;
  rowEstimate: number;
  sizeBytes: number;
}
export interface ColumnRow {
  table: string;
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  comment: string | null;
}
export interface ConstraintRow {
  name: string;
  type: string; // p = primary key, f = foreign key, u = unique, c = check
  table: string;
  refTable: string | null;
  columns: string[];
  refColumns: string[];
  onDelete: string;
  definition: string;
}
export interface IndexRow {
  table: string;
  name: string;
  columns: string[];
  unique: boolean;
  primary: boolean;
  definition: string;
}
export interface TriggerRow {
  table: string;
  name: string;
  definition: string;
}
export interface Catalog {
  tables: TableRow[];
  columns: ColumnRow[];
  constraints: ConstraintRow[];
  indexes: IndexRow[];
  triggers: TriggerRow[];
}

export interface Group {
  id: string;
  name: string;
  color: string;
  description: string;
  tables: string[];
}
export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  comment: string | null;
  pk: boolean;
  fk: boolean;
  unique: boolean;
}
export interface Table {
  name: string;
  group: string;
  note: string | null;
  comment: string | null;
  rowEstimate: number;
  sizeBytes: number;
  columns: Column[];
  primaryKey: string[];
  uniques: string[][];
  checks: string[];
  indexes: { name: string; unique: boolean; definition: string }[];
  triggers: { name: string; definition: string }[];
}
export interface Relation {
  id: string;
  kind: 'fk' | 'implicit';
  from: { table: string; columns: string[] };
  to: { table: string; columns: string[] };
  onDelete: string | null;
  note: string | null;
}
export interface SchemaModel {
  generatedAt: string;
  groups: Group[];
  tables: Table[];
  relations: Relation[];
  warnings: string[];
}

export const UNASSIGNED = '_unassigned';
const PALETTE = [
  '#4f46e5',
  '#0891b2',
  '#16a34a',
  '#d97706',
  '#db2777',
  '#7c3aed',
  '#dc2626',
  '#0d9488',
];
const ON_DELETE: Record<string, string | null> = {
  a: null,
  r: 'restrict',
  c: 'cascade',
  n: 'set null',
  d: 'set default',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

/** Parse "table.col" or "table.(a,b)" or "table". */
function endpoint(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  const dot = raw.indexOf('.');
  if (dot < 0) return { table: raw, columns: [] as string[] };
  const cols = raw
    .slice(dot + 1)
    .replace(/^\(|\)$/g, '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  return { table: raw.slice(0, dot), columns: cols };
}

export function buildModel(
  catalog: Catalog,
  meta: unknown,
  now = new Date(),
): SchemaModel {
  const warnings: string[] = [];
  const names = new Set(catalog.tables.map((t) => t.name));
  const columnsOf = new Map<string, Set<string>>();
  for (const c of catalog.columns) {
    if (!columnsOf.has(c.table)) columnsOf.set(c.table, new Set());
    columnsOf.get(c.table)!.add(c.name);
  }

  // Metadata is hand/agent maintained: tolerate mistakes, report them as warnings.
  const m = isRecord(meta) ? meta : {};
  if (meta !== undefined && !isRecord(meta))
    warnings.push('schema-meta.json is not a JSON object; ignored.');
  const groups: Group[] = [];
  const groupOf = new Map<string, string>();
  const rawGroups = Array.isArray(m.groups) ? m.groups : [];
  rawGroups.forEach((g, i) => {
    if (!isRecord(g) || !text(g.id) || !text(g.name)) {
      warnings.push(`Group #${i + 1} needs an id and a name; skipped.`);
      return;
    }
    const id = text(g.id)!;
    const tables: string[] = [];
    for (const t of Array.isArray(g.tables) ? g.tables : []) {
      const name = text(t);
      if (!name) continue;
      if (!names.has(name)) {
        warnings.push(
          `Group "${id}" lists "${name}", which is not in the database.`,
        );
        continue;
      }
      if (groupOf.has(name)) {
        warnings.push(
          `"${name}" is listed in more than one group; kept in "${groupOf.get(name)}".`,
        );
        continue;
      }
      groupOf.set(name, id);
      tables.push(name);
    }
    groups.push({
      id,
      name: text(g.name)!,
      color: text(g.color) ?? PALETTE[groups.length % PALETTE.length],
      description: text(g.description) ?? '',
      tables,
    });
  });
  const unassigned = catalog.tables
    .map((t) => t.name)
    .filter((n) => !groupOf.has(n));
  if (unassigned.length) {
    groups.push({
      id: UNASSIGNED,
      name: 'Unassigned',
      color: '#94a3b8',
      description: 'Tables not yet mapped to a group in docs/schema-meta.json.',
      tables: unassigned,
    });
    for (const n of unassigned) groupOf.set(n, UNASSIGNED);
  }

  const notes = isRecord(m.tables) ? m.tables : {};
  for (const name of Object.keys(notes))
    if (!names.has(name))
      warnings.push(`Note for "${name}", which is not in the database.`);

  const tables: Table[] = catalog.tables.map((t) => {
    const cons = catalog.constraints.filter((c) => c.table === t.name);
    const pk = cons.find((c) => c.type === 'p')?.columns ?? [];
    const fkCols = new Set(
      cons.filter((c) => c.type === 'f').flatMap((c) => c.columns),
    );
    // Unique constraints and unique indexes both enforce uniqueness.
    const uniques: string[][] = [];
    for (const cols of [
      ...cons.filter((c) => c.type === 'u').map((c) => c.columns),
      ...catalog.indexes
        .filter((i) => i.table === t.name && i.unique && !i.primary)
        .map((i) => i.columns),
    ])
      if (cols.length && !uniques.some((u) => u.join() === cols.join()))
        uniques.push(cols);
    const singleUnique = new Set(
      uniques.filter((u) => u.length === 1).map((u) => u[0]),
    );
    const entry = notes[t.name];
    return {
      name: t.name,
      group: groupOf.get(t.name) ?? UNASSIGNED,
      note: isRecord(entry) ? text(entry.note) : text(entry),
      comment: t.comment,
      rowEstimate: Math.max(0, Math.round(t.rowEstimate)),
      sizeBytes: t.sizeBytes,
      columns: catalog.columns
        .filter((c) => c.table === t.name)
        .map((c) => ({
          name: c.name,
          type: c.type,
          nullable: c.nullable,
          default: c.default,
          comment: c.comment,
          pk: pk.includes(c.name),
          fk: fkCols.has(c.name),
          unique: singleUnique.has(c.name),
        })),
      primaryKey: pk,
      uniques,
      checks: cons.filter((c) => c.type === 'c').map((c) => c.definition),
      indexes: catalog.indexes
        .filter((i) => i.table === t.name && !i.primary)
        .map((i) => ({
          name: i.name,
          unique: i.unique,
          definition: i.definition,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      triggers: catalog.triggers
        .filter((tr) => tr.table === t.name)
        .map((tr) => ({ name: tr.name, definition: tr.definition })),
    };
  });

  const relations: Relation[] = catalog.constraints
    .filter((c) => c.type === 'f' && c.refTable && names.has(c.refTable))
    .map((c) => ({
      id: `fk:${c.table}:${c.name}`,
      kind: 'fk' as const,
      from: { table: c.table, columns: c.columns },
      to: { table: c.refTable!, columns: c.refColumns },
      onDelete: ON_DELETE[c.onDelete] ?? null,
      note: null,
    }));
  const rawRelations = Array.isArray(m.relations) ? m.relations : [];
  rawRelations.forEach((r, i) => {
    const from = isRecord(r) ? endpoint(r.from) : null;
    const to = isRecord(r) ? endpoint(r.to) : null;
    if (!from || !to) {
      warnings.push(`Relation #${i + 1} needs "from" and "to"; skipped.`);
      return;
    }
    for (const end of [from, to]) {
      if (!names.has(end.table)) {
        warnings.push(
          `Relation #${i + 1} uses "${end.table}", which is not in the database; skipped.`,
        );
        return;
      }
      for (const col of end.columns)
        if (!columnsOf.get(end.table)?.has(col)) {
          warnings.push(
            `Relation #${i + 1} uses "${end.table}.${col}", which does not exist; skipped.`,
          );
          return;
        }
    }
    relations.push({
      id: `implicit:${i}`,
      kind: 'implicit',
      from,
      to,
      onDelete: null,
      note: isRecord(r) ? text(r.note) : null,
    });
  });

  return {
    generatedAt: now.toISOString(),
    groups,
    tables,
    relations,
    warnings,
  };
}
