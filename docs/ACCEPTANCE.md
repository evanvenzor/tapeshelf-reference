# V1 acceptance evidence

**V1 is not accepted yet.** Implementation is ready for owner review; public release, browser QA and real cloud execution remain outstanding. Reviewed 2026-11-18.

| Required acceptance item | Observed state |
| --- | --- |
| 1. Public HTTPS site on approved free hosting | Blocked: specific public hosting approval and provider connection pending. No live URL exists. |
| 2. Mobile and desktop search/filter works | Search/filter logic passes tests; responsive CSS and controls implemented. Actual browser interaction and visual validation blocked by Computer Use URL-policy detection. |
| 3. Source-backed initial information | Seven selected manufacturer-backed records and original guidance; ambiguous TZe-631 excluded. No physical fit testing or stock claims. |
| 4. CI passes and scheduled cloud check runs | Local test suite passes; CI and cron definitions prepared. Repository Actions disabled; no cloud or schedule-event run is claimed. |
| 5. Automated publishing demonstrated or model gate documented | Explicitly blocked pending approved hosted model execution, credentials and cost estimate. No automatic content publication path enabled. |
| 6. Affiliate integration gated and disclosed | Implemented; disabled by default and covered by negative tests. No agreement or application submitted. |
| 7. Weekly reporting job runs | Report generator executed locally with unavailable metrics labeled accurately. Cloud execution and owner-approved delivery destination still pending. |
| 8. README covers architecture, costs, secrets, recovery, deployment and approvals | Included, with source links and actual limits/unknowns separated. |
| 9. No unauthorized spending, email, agreements or unrelated changes | No paid services, outreach, affiliate applications, public release or changes to other repositories performed. |
| 10. Live/repo links, test results, approvals and instructions | Private repo and local build provided; live URL blocked rather than invented. |

Automated local checks cover the data schema, duplicate IDs/variants, evidence status, width/family limits, HTTPS source allowlist, per-SKU source mapping, invalid/future dates, excluded records, combined filters, normalized SKU search, zero results, disabled affiliate links, agreement/link gates, release prerequisites, network failure classifications, redirect restrictions, stale-review queue, missing metrics, internal links/anchors and artifact corruption. See the test command output and `test/catalog.test.mjs`.

The source availability run returned success for all ten distinct allowlisted URLs, including the deliberately excluded record's source. It does not prove the excluded claim is correct. The queue retains the conflict. A sample report and machine-readable run evidence are included under `docs/evidence/`; they are a one-time local snapshot, not live cloud telemetry.

Release procedure: complete approvals and browser QA, update factual host/contact configuration, build with `--release`, pass checks, deploy exact output, verify public HTTPS hashes, run CI and operations on an approved free runner, then verify an actual scheduled event. Update this file with real run URLs and timestamps; do not replace blocked items with guesses.
