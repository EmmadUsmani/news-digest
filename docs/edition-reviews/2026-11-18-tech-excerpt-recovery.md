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
