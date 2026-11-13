# Tech launch versus sales pitch — iteration 2124

## Decision

Retain the saved FishAudio Live 3 selection. Its full-duplex voice announcement
adds a distinct concrete capability to this edition. The available alternatives
do not establish a stronger distinct replacement. No scoring, prompt or saved
publication changes are warranted by this comparison.

## Saved evidence

- Edition `eb6e962e-200d-4efc-9f6f-2c7e58743bd8`, window Nov 10–11,
  15:00 UTC. Five X posts; 84 saved triage scores, zero unscored IDs.
- Nine candidates passed relevance ≥6 and interestingness ≥4. Five were picked.
- The production candidate reader currently reconstructs 92 in-window Tech
  candidates. Eight have no score in this saved edition; they are not evidence
  of an editor omission. The comparison uses the 84 saved scores, not today's
  scoring fingerprint or a fresh model call.
- Read via a repeatable-read, read-only Postgres transaction with a 15-second
  statement timeout. Cross-checked the 84 historical per-item cache responses
  against saved candidate identities. No provider instantiated, jobs queued or
  database writes made.

| Candidate                                                                   | Relevance / interestingness | Comparison                                                                                                                         |
| --------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [FishAudio Live 3](https://x.com/i/status/2120214987633467626)              | 8 / 5                       | Selected: simultaneous listening/speaking and backchannel responses; enterprise demo/free-agent offer also present.                |
| [Techmeme Claude office tools](https://x.com/i/status/2120208983889961451)  | 8 / 6                       | Higher interestingness, but repeats the selected official Claude Whiteboards/Sheets/Data launch.                                   |
| [Thariq on collaborative tools](https://x.com/i/status/2120223476279869875) | 7 / 5                       | Distinct opinion; no specific new tool or launch described.                                                                        |
| [Anthropic cloud commitments](https://x.com/i/status/2120234411283370211)   | 6 / 5                       | Distinct filing detail, but weaker topic relevance and another Anthropic filing post alongside the selected scaling-policy update. |
| [OptimAI video integration](https://x.com/i/status/2120169728199278880)     | 6 / 4                       | Lower scores; its saved rationale also identifies promotional tone.                                                                |

The other selected posts are PAN 2 (9/7), the official Claude tools announcement
(8/6), Andrew Curran's scaling-policy filing report (7/6), and Kevin Ngo's
browser-game demo (7/6). Their original text supplies the comparison; linked
video contents were not inspected or inferred.

## Why the launch earns its slot

The saved triage rationale says “Voice model launch; ends in demo/free-agent
promotion.” The final editor likewise calls out the promotional offer while
explaining the voice capability. The offer was visible to both stages, rather
than lost in transport. The selected reader context explains full-duplex voice
without repeating the offer.

Empty official `metrics` do not mean there was no engagement evidence. Saved
selection reasons report unverified xAI search counts: 2,340 likes, 371 reposts,
918 replies and 1,309,796 views, observed Nov 11 at 14:32:35.183 UTC. These
contributed a bounded 1.79/2 ranking bonus. They are neither official metrics
nor proof of organic attention; the reply offer can itself attract replies.

This resolves the specific comparison proposed in `docs/ideas.md`. It does not
establish general promotional quality or Bluesky diversity acceptance. Revisit
when a real edition supplies a stronger distinct eligible alternative, rather
than adding a phrase filter or paying to rescore unchanged material.
