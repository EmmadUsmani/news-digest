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

## Optimizely publisher evidence — iteration 2691

The latest public Tech story still describes an HN allegation. Two saved blank
HN candidates now retain publisher reporting through the deployed extractor:

| Candidate                                                                                             | Before | After | Retained detail                                                       |
| ----------------------------------------------------------------------------------------------------- | -----: | ----: | --------------------------------------------------------------------- |
| [Report URI](https://blog.report-uri.com/worlds-largest-brands-infected-with-malware-via-optimizely/) |      0 | 1,500 | Publisher-reported infection scope, wallet/card theft and mitigation  |
| [OptimJack investigation](https://amirulcyber.com/2026/11/16/optimjack-optimizely-skimmer/)           |      0 | 1,500 | Investigator-reported injected bundles, affected sites and CSP checks |

Both ordinary shared-client requests returned HTTP 200. Exact saved ID/text
rereads pass for `b03cbe03-4be2-4910-a06d-bbea40028526` and
`c2e91f6e-e6c3-4ea2-9ac3-1bb4b1c125bd`; only blank excerpts changed.
The accounts differ in scope and remain attributed publisher claims, not an
independent confirmation of every affected site. Report URI also promotes its
own product. No paid calls, generation, budget or collection behavior change.
The immutable edition is unchanged; natural scheduled acceptance remains pending.

## Browser tooling and rendering evidence — iteration 2692

Two ordinary shared-client HTTP 200 responses yielded publisher prose with the
deployed extractor. Blank-only saved updates and independent exact ID/text
rereads pass for both candidates (2,042 characters total).

| Candidate                                                                                         | Before | After | Retained detail                                                   |
| ------------------------------------------------------------------------------------------------- | -----: | ----: | ----------------------------------------------------------------- |
| [OpenCode Browse](https://opencode.ai/product/browse)                                             |      0 |   542 | MCP/Chromium workflow, existing sessions and human handoff        |
| [Three.js lighting pipeline](https://ben3d.ca/blog/building-the-aaa-lighting-pipeline-in-threejs) |      0 | 1,500 | Cache setup, screen-space rendering gaps and proposed integration |

OpenCode is first-party product description; the lighting article distinguishes
proposals from integrated functionality. Neither is independent validation.
Web Browser Engineering returned HTTP 200 but no scoped excerpt and stays blank.
No extraction behavior, budgets or editions changed; no paid calls or bypasses.
Natural scheduled Tech acceptance remains pending after 15:00 UTC.

## Rust and HTTP/3 evidence — iteration 2693

Three ordinary shared-client HTTP 200 responses yielded scoped publisher prose
with the deployed extractor. Blank-only updates and independent exact ID/text
rereads pass: three candidates, 1,500 characters each (4,500 total).

| Candidate                                                                                            | Saved ID                             | Retained detail                                   |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| [Rust developer essay](https://blog.startifact.com/posts/how-rust-changed-me/)                       | 7fb3869b-7dee-42d1-9aa4-925117450cf3 | Author experience, product and sum types          |
| [HTTP/3 interception](https://interceptsuite.com/blog/intercept-http3-traffic-quic-qpack-explained/) | 6ff6bb0d-02cb-414e-b7e8-a2de3e0dfd4b | QUIC/UDP transport, QPACK and extension workflow  |
| [Jiff 1.0](https://burntsushi.net/jiff/)                                                             | d7880d01-13d1-438e-b56e-67ef4c2e1d0d | Time zones, adoption and API stability commitment |

The essay is personal experience; the tutorial includes first-party product
promotion; Jiff adoption and commitments remain author claims. The jQuery
GitHub release returned HTTP 200 but only a bare publisher link, so stays blank.
No extraction behavior, budgets or immutable editions changed; no paid calls.
Natural scheduled Tech acceptance remains pending after 15:00 UTC.

## Software reliability and display evidence — iteration 2694

Two ordinary shared-client HTTP 200 responses yielded scoped publisher prose
through the deployed extractor. Blank-only updates and independent exact ID/text
rereads pass: two candidates, 1,500 characters each (3,000 total).

| Candidate                                                                                                             | Saved ID                             | Retained detail                                                             |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| [Software reliability essay](https://www.breck-mckye.com/blog/2026/11/software-is-breaking-down-at-a-systemic-level/) | 0224e4cf-98a2-434d-aba7-50b49495de94 | Author's outage examples and argument about AI and software practices       |
| [TRMNL Frame announcement](https://trmnl.com/blog/introducing-frame)                                                  | f9ea7442-f906-469b-b4f0-b209d5b32c21 | First-party 31.5-inch color ePaper preorders, batch size and delivery plans |

The essay's outage and vulnerability claims remain attributed opinion, not
independent incident verification. TRMNL's intended delivery dates are plans.
CMU's course page returned HTTP 200 but no scoped excerpt and stays blank.
No extraction behavior, budgets or immutable editions changed; no paid calls.
Natural scheduled Tech acceptance remains pending after 15:00 UTC.

## Rust verification and solar research — iteration 2695

Two ordinary shared-client HTTP 200 publisher pages recovered blank saved HN
excerpts with the deployed extractor. Exact ID/text rereads pass for both rows,
3,000 characters total; only blank excerpts changed.

| Candidate                                                                                                                             | Before | After | Retained detail                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------- | -----: | ----: | -------------------------------------------------------------------------- |
| [Aristotle Rust verification](https://www.harmonic.fun/news/aristotle-rust-verification/)                                             |      0 | 1,500 | Harmonic’s claimed verification support, unsafe blocks and C equivalence   |
| [Cornell solar grazing](https://news.cornell.edu/stories/2026/10/sheep-grazing-solar-fields-offers-farmers-economic-ecological-gains) |      0 | 1,500 | Reported stocking density, beneficial-insect results and study attribution |

Harmonic’s capabilities remain first-party claims; Cornell’s October paper is
research context, not a newly published November study. Jolt returned HTTP 200
but lacks a scoped article/main body and stays blank. No access workaround,
paid call, edition regeneration or budget change. The public Tech edition still
has thin summaries; scheduled candidate-share/depth acceptance remains pending.

## DNS, hardware security and reuse evidence — iteration 2696

Three ordinary shared-client HTTP 200 responses recovered blank saved HN
excerpts using the deployed extractor. Blank-only updates and independent exact
ID/text rereads pass for all three: 0 → 1,500 characters each, 4,500 total.

| Candidate                                                           | Retained detail                                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [S2 authoritative DNS](https://s2.dev/blog/dns-server)              | First-party basin namespaces, immediate resolution needs and reported Route53 update limits |
| [Windows Hello research](https://arxiv.org/abs/2611.18126)          | Authors' physical-access RPMC analysis and claimed firmware TPM rollback demonstrations     |
| [Do Repeat Yourself](https://arcentry.com/blog/do-repeat-yourself/) | Fictional banking-team example introducing the author's software-reuse argument             |

S2's operational claims remain attributed to S2. The security abstract describes
research claims requiring physical hardware access, not a remotely exploitable
PIN attack. The essay's Megabank teams are illustrative characters, not reported
company events. No budgets, extraction behavior or immutable editions changed.
Public HTTPS reader still shows thin Tech summaries; natural scheduled
candidate-share/depth acceptance remains pending after 15:00 UTC.

## Publisher header titles — iteration 2697

Infisical and Notifkit returned HTTP 200 but yielded empty excerpts because
removing `<header>` also removed their only `<h1>`. The collector now retains
that title while discarding header metadata. Main reporting still requires its
own heading; unrelated outside headings and header promotions remain excluded.
Recorded reduced publisher fixtures and regression tests cover the layouts.

Blank-only updates and independent exact ID/text rereads pass for three saved
HN candidates, each 0 → 1,500 characters (4,500 total):

| Candidate                                                                                          | Retained detail                                                                   |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [Infisical identity management](https://infisical.com/blog/active-directory-machine-identity)      | Author's AD/LDAP/Kerberos account and modern-cloud identity argument              |
| [Siterate investigation](https://jack.cab/blog/siterate)                                           | Author's backlink observations and Majestic Million ranking context               |
| [Notification engineering](https://notifkit.dev/articles/why-notification-systems-are-a-nightmare) | Illustrative shop workflow, provider tradeoffs and first-party project motivation |

The opening AD quotation and notification shop are explicitly fictional;
product comparisons remain author claims. Jack's investigation is personal
reporting. Signed-out Tech still has thin summaries; immutable editions and
budgets unchanged. Scheduled candidate-share/depth acceptance awaits 15:00 UTC.

## Security research and technical context — iteration 2698

Three ordinary shared-client HTTP 200 publisher responses recovered blank saved
HN excerpts using deployed extraction. Blank-only writes and independent exact
ID/text rereads pass: three rows, 0 → 1,500 characters each (4,500 total).

| Candidate                                                                                                               | Retained detail                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [uBlock Origin UXSS](https://iter.ca/post/ubo-uxss/)                                                                    | Researcher's reported one-click filter-injection issue, Firefox scope and explicit fixed status |
| [ThinkPad recovery](https://masnick.com/posts/the-secret-thinkpad-powerbutton-code-to-bring-dead-laptops-back-to-life/) | Historical first-person laptop failure and support interaction; not a new hardware incident     |
| [Squircles](https://linebender.org/wiki/curves/squircle/)                                                               | Superellipse definition, exponent and gauge, and alternative curve constructions                |

The ThinkPad opening ends before the complete recovery instructions; it must not
be treated as a complete procedure. Security findings remain researcher claims.
Lean and Astra testing pages returned HTTP 200 but no scoped excerpt; left blank.
No access workaround, paid call, extraction change or edition regeneration.
Public HTTPS Chromium reader passes five topics/25 stories/20 posts; current
Tech remains thin. Scheduled candidate-share/depth acceptance is pending.

## WordPress article bodies — iteration 2699

The Lean publisher page returned HTTP 200 but used an h2 entry-title and a
WordPress entry-content body, so the h1-based main fallback saved nothing.
The collector now recognizes entry-content within a titled hentry. Comments
and adjacent navigation remain outside the body; unscoped/archive containers
remain rejected. A reduced recorded fixture covers the real layout.

The saved [Lean interpretation article](https://xenaproject.wordpress.com/2026/11/12/and-the-proof-is-checked-in-lean/)
changed from 0 to 1,500 characters; independent ID/text reread passes. The opening
retains the author's distinction between proof checking and checking what was
formalized; it does not establish that the referenced repositories fail checks.
Immutable editions and budgets unchanged; scheduled depth acceptance pending.
