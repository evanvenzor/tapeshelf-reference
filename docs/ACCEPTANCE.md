# V1 acceptance evidence

Reviewed November 18, 2026. The public release is operational. Final V1 acceptance currently awaits evidence of a successful timer-triggered GitHub run.

Website: https://tapeshelf-reference.pages.dev
Repository: https://github.com/evanvenzor/tapeshelf-reference

| Required acceptance item | Observed state |
| --- | --- |
| 1. Public HTTPS site on approved free hosting | Passed. New Cloudflare Pages Direct Upload project; production returns HTTP 200. All deployable file hashes match the tested release. |
| 2. Mobile and desktop search/filter works | Nine Chromium checks pass at 1440, 390 and 320 px. Desktop/mobile screenshots visually reviewed; reset, combined filters, empty results, keyboard focus, navigation, no-JavaScript records and overflow covered. The same nine checks also passed against the actual public HTTPS site. |
| 3. Source-backed initial information | Seven selected manufacturer-backed records and original guidance. Ambiguous TZe-631 excluded. No physical fit testing or stock claims. |
| 4. CI passes and scheduled cloud check runs | CI passes 38 deterministic tests and nine browser checks. UNVERIFIED: manual operations succeeded, but GitHub has not emitted a timer event. Workflow active on main; OPERATIONS_APPROVED=true. |
| 5. Automated publishing demonstrated or model gate documented | Permitted blocked-model path: unattended publication explicitly blocked pending approved hosted execution, scoped credentials and a cost estimate. |
| 6. Affiliate integration gated and disclosed | Passed. Disabled by default, negative tests cover activation requirements; no application or agreement submitted. |
| 7. Weekly reporting job runs | Passed. Cloud operations generated a report with missing metrics labeled Unavailable and delivered it to the approved GitHub job summary. |
| 8. README covers architecture, costs, secrets, recovery, deployment and approvals | Included. Remaining optional approvals are identified explicitly. |
| 9. No unauthorized spending, email, agreements or unrelated changes | The owner approved public repository/site launch and free cloud checks. No spending, email, affiliate application, new agreement or unrelated repository change performed. |
| 10. Handoff links, tests, approvals and instructions | Live/repository links above; operating instructions in README; remaining gates in APPROVALS.md. |

## Release evidence

- Release source revision: be4d8a254acc8e3fa5b4b7fdcc82223e980eb50c. Uncommitted documentation at deployment did not affect generated files.
- Immutable provider deployment: https://63a54cda.tapeshelf-reference.pages.dev
- Production checks: [cloud operations run](https://github.com/evanvenzor/tapeshelf-reference/actions/runs/44348916081), successfully completed November 18, 2026. This run was manually dispatched, not a timer event.
- [Live browser verification](https://github.com/evanvenzor/tapeshelf-reference/actions/runs/44349000834): 38 deterministic tests, nine local-server browser checks and nine public-site browser checks passed. All three generated screenshots were visually reviewed; evidence remains in the run log.
- [Release CI](https://github.com/evanvenzor/tapeshelf-reference/actions/runs/44348800987): 38 deterministic tests and nine browser checks passed.
- HTTPS content verification: all public files matched the local SHA-256 manifest; 16 generated files, 56,462 bytes, 104 internal links.
- Live security headers verified: nosniff, no-referrer and frame denial.
- All ten distinct allowlisted source URLs returned successful HTTP responses. Reachability does not prove the claims; factual provenance is separately documented in SOURCES.md.
- Two queue entries remain deliberately unpublished: the conflicting TZe-631 specification and other models/specialty tapes outside V1.

The deterministic suite covers schema errors, duplicate IDs/variants, evidence status, dimensions/family limits, HTTPS source allowlists, per-SKU source mapping, dates, excluded records, combined/normalized searches, missing results, affiliate gates, release prerequisites, network failures, redirects, stale reviews, unavailable metrics, broken links/anchors and artifact corruption. The browser tests caught and led to repairs for select-label accessibility and a native form-reset timing defect.

## Outstanding acceptance blocker

At 16:46 UTC on November 18, 2026, the GitHub Actions API returned no runs with event=schedule. Temporary opportunities at 16:35 and 16:45 UTC produced no observed event during this session; the cause is not established. GitHub documents that schedule delivery can be delayed or dropped. The workflow is active on the default branch and its approval variable is true. Manual execution successfully validates the production site and produces the report, so this is not presented as a job-code failure.

Temporary triggers have been removed. Daily 09:23 UTC and Monday 10:37 UTC schedules remain enabled. The next regular daily opportunity is November 19 at 09:23 UTC, subject to GitHub delivery. No further owner authorization is needed. Final acceptance requires observing a successful actual schedule event and recording its URL here; a manual dispatch is insufficient. V1 must not be described as fully accepted before that evidence exists.

## Operating limits

No analytics, Search Console, affiliate reporting or model API is connected. Their metrics remain Unavailable. Affiliate activation requires program acceptance, identifiers, approved links and explicit owner authorization. Hosted content generation requires an approved execution service and cost estimate. These are documented gates, not evidence of traffic, earnings or full agentic autonomy.

No further scope expansion is part of this V1. See README for checking reports, rerunning validation, making a reviewed release and recovery.
