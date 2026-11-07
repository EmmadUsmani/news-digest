# Handbook command palette

**Status:** built by a lead session at the owner's request (Nov 7) and pushed to
`main` (`c4a14b23`). Not live yet: the VM's handbook service needs a restart to
serve the new `/api/pages` route.

**What it is:** ⌘K / Ctrl K / `/` opens a palette in the handbook site: recent
pages, all pages, admin tools, and full-text search over every h1–h4 section.
Code: `apps/docs-site/public/search.js` (index and ranking),
`apps/docs-site/public/app.js` (palette). Tests: `apps/docs-site/src/search.test.ts`.

**Risk until restart:** once the VM pulls `main`, the new page code asks for
`/api/pages`, which the old server answers 404. Navigation keeps working;
search shows "Loading the handbook…".

**Next:**

1. Owner approves restarting only the handbook service on the VM, outside
   13:00–16:00 UTC; or the agent's next deploy restarts it.
2. After restart: `/api/pages` returns 200, ⌘K search works on the live site.

**Out of scope (owner chose handbook-only):** a palette in the main admin app.
