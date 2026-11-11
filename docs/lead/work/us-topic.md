# U.S. news & politics topic

**Status (21:45 UTC Nov 11):** agent started at 18:16 (item 50 stopped for
the phase 4 review). 18 iterations: offline split of saved World stories (23
World / 5 U.S.), three free domestic feeds tested (Guardian US, NPR Politics,
PBS Politics), and the one-story-one-topic pipeline built but not connected.
Not live. It is stuck on a cost gate: the plan's "1.5× reserve must fit under the
cap" rule, which today's four-topic editions already fail. That rule was a lead
wording mistake; production clamps the reserve to the cap.

**Goal:** split World into World news & politics (global, including US foreign
policy) and U.S. news & politics (domestic). One story, one topic. Both visible
by default. Design: [plan](../../us-news-topic-plan.md).

**Owner decisions (2026-11-11):** the boundary and names above; visible by
default; X caps raised to $0.50/day and $15/month; AI daily cap may rise to at
most $0.65, only if measured as needed.

**Next:**

- Owner to approve a fix: drop the 1.5× rule; maybe raise the AI monthly
  budget (`LLM_MONTHLY_BUDGET_USD`, $14, capped at 14 in code).
- Then check the agent wires the split into the edition and goes live.

**Open decisions:** the cost-gate fix and the AI monthly budget (proposed Nov 11).
