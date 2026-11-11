import type { SchemaModel } from './model.ts';

// Prepared transport boundary only. The private explorer keeps its full model.
// Construct every object explicitly: catalog definitions, activity statistics,
// metadata prose and future model fields must never enter this response by default.
export function buildPublicModel(model: SchemaModel) {
  return {
    groups: model.groups.map((group) => ({
      id: group.id,
      name: group.name,
      color: group.color,
      tables: [...group.tables],
    })),
    tables: model.tables.map((table) => ({
      name: table.name,
      group: table.group,
      columns: table.columns.map((column) => ({
        name: column.name,
        type: column.type,
        nullable: column.nullable,
        pk: column.pk,
        fk: column.fk,
        unique: column.unique,
      })),
      primaryKey: [...table.primaryKey],
      uniques: table.uniques.map((columns) => [...columns]),
    })),
    relations: model.relations.map((relation) => ({
      id: relation.id,
      kind: relation.kind,
      from: { table: relation.from.table, columns: [...relation.from.columns] },
      to: { table: relation.to.table, columns: [...relation.to.columns] },
      onDelete: relation.onDelete,
    })),
  };
}
