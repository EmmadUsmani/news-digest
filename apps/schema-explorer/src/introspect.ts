import pg from 'pg';

import type { Catalog } from './model.ts';

// Catalog-only queries: never reads application rows. Row counts are planner/
// statistics estimates (pg_stat_user_tables), not COUNT(*).
const TABLES = `
SELECT c.relname AS name, obj_description(c.oid, 'pg_class') AS comment,
       COALESCE(s.n_live_tup, GREATEST(c.reltuples, 0))::float8 AS "rowEstimate",
       pg_total_relation_size(c.oid)::float8 AS "sizeBytes"
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
WHERE n.nspname = $1 AND c.relkind IN ('r', 'p')
ORDER BY c.relname`;

const COLUMNS = `
SELECT c.relname AS "table", a.attname AS name,
       format_type(a.atttypid, a.atttypmod) AS type,
       NOT a.attnotnull AS nullable,
       pg_get_expr(d.adbin, d.adrelid) AS "default",
       col_description(c.oid, a.attnum) AS comment
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
WHERE n.nspname = $1 AND c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped
ORDER BY c.relname, a.attnum`;

const CONSTRAINTS = `
SELECT con.conname AS name, con.contype::text AS type, c.relname AS "table",
       rc.relname AS "refTable",
       ARRAY(SELECT a.attname::text FROM unnest(con.conkey) WITH ORDINALITY k(num, ord)
             JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.num
             ORDER BY k.ord) AS columns,
       ARRAY(SELECT a.attname::text FROM unnest(con.confkey) WITH ORDINALITY k(num, ord)
             JOIN pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = k.num
             ORDER BY k.ord) AS "refColumns",
       con.confdeltype::text AS "onDelete",
       pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_class rc ON rc.oid = con.confrelid
WHERE n.nspname = $1 AND con.contype IN ('p', 'f', 'u', 'c')
ORDER BY c.relname, con.conname`;

const INDEXES = `
SELECT t.relname AS "table", i.relname AS name,
       ARRAY(SELECT a.attname::text FROM unnest(ix.indkey) WITH ORDINALITY k(num, ord)
             JOIN pg_attribute a ON a.attrelid = ix.indrelid AND a.attnum = k.num
             ORDER BY k.ord) AS columns,
       ix.indisunique AS "unique", ix.indisprimary AS "primary",
       pg_get_indexdef(ix.indexrelid) AS definition
FROM pg_index ix
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_class t ON t.oid = ix.indrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = $1
ORDER BY t.relname, i.relname`;

const TRIGGERS = `
SELECT c.relname AS "table", tg.tgname AS name, pg_get_triggerdef(tg.oid) AS definition
FROM pg_trigger tg
JOIN pg_class c ON c.oid = tg.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = $1 AND NOT tg.tgisinternal
ORDER BY c.relname, tg.tgname`;

export function createPool(connectionString: string) {
  return new pg.Pool({
    connectionString,
    max: 2,
    // Defence in depth: this tool only reads the catalog.
    options: '-c default_transaction_read_only=on -c statement_timeout=10000',
    application_name: 'schema-explorer',
  });
}

export async function introspect(
  pool: pg.Pool,
  schema = 'public',
): Promise<Catalog> {
  const [tables, columns, constraints, indexes, triggers] = await Promise.all(
    [TABLES, COLUMNS, CONSTRAINTS, INDEXES, TRIGGERS].map((sql) =>
      pool.query(sql, [schema]),
    ),
  );
  return {
    tables: tables.rows as Catalog['tables'],
    columns: columns.rows as Catalog['columns'],
    constraints: constraints.rows as Catalog['constraints'],
    indexes: indexes.rows as Catalog['indexes'],
    triggers: triggers.rows as Catalog['triggers'],
  };
}
