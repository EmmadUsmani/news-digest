# UI rebuild

**Status:** the agent closed item 33 on Nov 7 (item 45), but one change is in
question. To meet the length limit it put desktop posts in a 1,400 px inner
scroll box (`87077bb1`, `apps/web/src/TopPosts.tsx`). The spec says one scrolling
page. Without the box, NBA was 3.52 screens and Gaming 3.35. Waiting on the owner.

**Spec:** [docs/ui-spec.md](../../ui-spec.md), STEERING item 33. The ack there
marks it finished, with screenshots of every route.

**Next:**

- Owner decides whether the inner scroll box stays.
- Confirm the owner's real login gets `isAdmin: true` at `/api/me`.
