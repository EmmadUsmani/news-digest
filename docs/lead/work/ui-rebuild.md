# UI rebuild

**Status:** in progress, raised to priority 3 on Nov 6 (STEERING item 43).
Admin pages are built. The final reader is under way: one full-width post per
row, contents sidebar, archive navigation and accessibility fixes have landed.

**Spec:** [docs/ui-spec.md](../../ui-spec.md), STEERING item 33. The ack there
marks it finished, with screenshots of every route.

**Next:**

- Review admin pages and the reader against the spec once the agent acks.
- Item 45 (Nov 7): the agent lists real gaps against the spec, finishes them and
  closes item 33 within 20 iterations. Check the list in `TASKS.md` is honest.
- Confirm the owner's real login gets `isAdmin: true` at `/api/me`.
