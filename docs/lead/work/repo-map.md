# Repo Map

**Status:** design stage. First canvas published for the owner to review. Nothing
is built.

**Goal:** a third internal tool, at `/map/` beside `/docs/` and `/db/`. It shows
every part of the repo, what it's for and how it connects, and it stays current
without anyone maintaining it by hand.

**Who builds it:** a lead session, on the owner's instruction. Not the build
agent, so no steering and no place on Current order.

**Decided by the owner (2026-11-05):**

- AI writes every description. The owner doesn't write or maintain any.
- Go ahead on the lead's other design assumptions unless the owner overrules one:
  Map as home view, dark look with a light mode.

**Design so far:**

- Four views: Map (treemap), Tree, Table, Connections, sharing one side panel.
- Two groupings of the same files: Purpose and Folders.
- Overlays: recent activity, and following a flow such as the morning edition.
- Facts come live from git and the dependency checker (`pnpm boundaries`' tool).
- History, generated files and tests collapse out of the default Map.

**Next:**

1. Owner reviews the canvas: https://claude.ai/artifact/KXR5SFhD1F6xJkE1qgxafU
2. Settle how AI descriptions refresh, and what that costs. New spend needs the
   owner's approval.
3. Plan the build, then build it as `apps/repo-map`, modelled on
   `apps/schema-explorer`.

**Found while designing, not acted on:**

- `curation/public/cached-article-triage.ts`: nothing imports it.
- `libs/ports/http.client.ts` imports from `ingestion`, against the usual
  direction.
