# UI rebuild

**Status:** in progress, raised to priority 3 on Nov 6 (STEERING item 43).
Admin pages are built. The final reader is under way: one full-width post per
row, contents sidebar, archive navigation and accessibility fixes have landed.

**Spec:** [docs/ui-spec.md](../../ui-spec.md), STEERING item 33. The ack there
marks it finished, with screenshots of every route.

**Next:**

- Review admin pages and the reader against the spec once the agent acks.
- Watch the agent's commits: scoping stopped after item 43, but by Nov 7 they had
  become small edge-case fixes tested on synthetic data, with no finish in sight.
- Confirm the owner's real login gets `isAdmin: true` at `/api/me`.
