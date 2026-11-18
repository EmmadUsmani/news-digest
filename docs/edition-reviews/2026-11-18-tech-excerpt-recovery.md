# Saved Tech excerpt recovery — November 18, iteration 2686

Eight saved HN candidates still had empty excerpts after the publisher extractor
was deployed. A bounded backfill used ordinary HTTP 200 publisher pages through
the shared HTTP client and the deployed extractor. Each extracted passage was
reviewed before updating only rows whose excerpt was still blank.

| Candidate                                                                                                                                                              | Before | After | Retained detail                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -----: | ----: | ------------------------------------------------------------ |
| [Human.md](https://www.human-md.ai/)                                                                                                                                   |      0 | 1,500 | Human judgment and creative work                             |
| [PostHog decision models](https://newsletter.posthog.com/p/decision-models)                                                                                            |      0 | 1,500 | Typed probabilities, calibration and production use          |
| [Apple service outage](https://9to5mac.com/2026/11/17/icloud-app-store-and-other-apple-services-hit-by-ongoing-outage/)                                                |      0 | 1,500 | Affected services, sign-in failures and status reports       |
| [US machine tools](https://read.corematter.com/p/section-232-us-machine-tools)                                                                                         |      0 | 1,500 | Section 232 window and domestic production capacity          |
| [Optimizely supply-chain attack](https://www.bleepingcomputer.com/news/security/optimizely-supply-chain-attack-delivers-malware-to-cnn-fox-news-bbc-salesforce-sites/) |      0 | 1,500 | Injected JavaScript, affected sites and vendor response      |
| [Antfly Apache 2.0](https://antfly.io/thoughts/how-antfly-learned-to-stop-worrying-and-love-apache-2)                                                                  |      0 | 1,500 | Licensing change and cloud-provider rationale                |
| [Java4Shell](https://www.aikido.dev/blog/java-17-rce-vulnerability-cve-2026-114938)                                                                                    |      0 | 1,500 | Reported affected builds, patches and disclosure uncertainty |
| [Better open source](https://jordankrueger.com/blog/better-open-source-not-more-apps/)                                                                                 |      0 | 1,500 | Self-hosting and nonprofit operational needs                 |

The same eight stored IDs now contain 12,000 characters in total. This is a
saved-candidate repair, not a scheduled candidate-share measurement. No edition
was regenerated or altered. Scheduled Tech depth acceptance remains after
15:00 UTC. Collection, grouping, prompts, admission flags and budgets are unchanged.

Tencent Hy4 Flash returned HTTP 200 but only an application shell with no
reporting paragraphs; its excerpt remains empty. Previously named access blocks
were not retried, and no X pages or unofficial mirrors were requested.

## Additional saved candidates — iteration 2687

Four further blank saved candidates were recovered from ordinary shared-client
HTTP 200 publisher responses using the unchanged deployed extractor.

| Candidate                                                                                           | Before | After | Retained detail                                                            |
| --------------------------------------------------------------------------------------------------- | -----: | ----: | -------------------------------------------------------------------------- |
| [Loopholes Are for Assholes](https://actsofvolition.com/2026/11/loopholes-are-for-assholes/)        |      0 |   902 | Author’s argument about universalizing behavior                            |
| [My Empire of Dirt](https://geohot.github.io//blog/jekyll/update/2026/11/17/my-empire-of-dirt.html) |      0 | 1,500 | Author’s criticism of AI power concentration, retained as opinion          |
| [Mem shutdown](https://get.mem.ai/blog/mem-is-shutting-down)                                        |      0 | 1,500 | January 15 shutdown, December 18 read-only transition, billing and exports |
| [Running agents with lend](https://blog.antonio.cx/running-agents-with-lend)                        |      0 | 1,500 | Remote agents, local credentials and approval workflow                     |

Exact stored IDs and text were reread successfully: four rows, 5,402 characters.
Only blank excerpts changed. Claude.dev’s verification post and the Browser
Engineering landing page returned HTTP 200 but no scoped reporting with this
extractor; both remain empty. No access workaround or edition regeneration.

The latest public Tech section still includes one-sentence Apple/China summaries
and the Optimizely HN allegation; these repairs enrich the next candidate pool,
not that immutable edition. Natural share/depth acceptance remains pending.

## Article-template collection repair — iteration 2688

The Claude.dev verification post uses `data-tpl="article"` with a heading and a
nested `#body.prose`, rather than article/main. Collection now recognizes that
explicit structure and reads only its body, excluding related posts.

| Candidate                                                                                               | Before | After | Retained detail                                                      |
| ------------------------------------------------------------------------------------------------------- | -----: | ----: | -------------------------------------------------------------------- |
| [Claude Code verification](https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/) |      0 | 1,500 | Verification loops, separate grading and reported task-success gains |

An ordinary shared-client HTTP 200 returned 105,652 bytes. Blank-only update of
stored ID `1f4a5def-0ddd-416f-bf1d-55745900fbd9` was reread and matched exactly.
The previous edition stays unchanged; natural candidate-share/depth acceptance
remains after 15:00 UTC. No paid calls, access workaround or budget change.

## Additional saved reporting — iteration 2689

Three ordinary shared-client HTTP 200 responses yielded reporting with the
unchanged deployed extractor. Blank-only updates were reread by ID and exact
text: three rows, 4,500 characters total.

| Candidate                                                                                                       | Before | After | Retained detail                                                            |
| --------------------------------------------------------------------------------------------------------------- | -----: | ----: | -------------------------------------------------------------------------- |
| [Windows coding-agent telemetry](https://xusheng.dev/posts/windows-coding-agent-telemetry/)                     |      0 | 1,500 | Author’s binary investigation, local recording and diagnostic upload claim |
| [Spamhaus sender guidelines](https://www.spamhaus.org/sender-guidelines/)                                       |      0 | 1,500 | November rollout, HELO and forward-confirmed reverse DNS requirements      |
| [Krebs security careers (2012)](https://krebsonsecurity.com/2012/06/how-to-break-into-security-ptacek-edition/) |      0 | 1,500 | Historical interview introduction and password-security context            |

The Krebs excerpt retains its historical framing; it is not new reporting.
Apple’s Full Disk Access support page returned HTTP 200 but no scoped prose;
its saved excerpt remains blank. No blocks were bypassed, no paid calls were
made, and no edition was changed. Natural acceptance remains after 15:00 UTC.

## ARIA main collection repair — iteration 2690

Apple’s support page uses a div with `role="main"`, rather than a native main
or article. Collection now reads that landmark with the same heading requirement
and paragraph filters as main. Surrounding prose and navigation stay excluded.

The previously fetched ordinary HTTP 200 page at
[Apple permissions](https://support.apple.com/en-us/149699) now yields 1,500
characters: macOS 27.3 folder/app choices, permission risks and backup/security
app context. Saved ID `6b5b2eeb-c4ad-4612-8647-186a405e1dfa` changed from blank
to that exact excerpt; an independent database reread matches ID and full text.
Recorded publisher paragraphs and landmark boundary/precedence tests pass.
No edition regeneration, paid calls or budget changes; scheduled acceptance pending.
