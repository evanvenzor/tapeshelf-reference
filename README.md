# TapeShelf

A small, source-backed tape finder for the US Brother PT-D210. Seven standard laminated TZe records; search by code or color and filter by width/background. One reference page and supporting guidance, sources, about, contact, privacy and affiliate disclosure pages. No runtime framework, database, paid API or external font. Playwright is a locked development-only dependency for cloud browser tests.

**Status: publicly deployed on approved Cloudflare Pages Free. Final acceptance awaits the first actual scheduled event.** See [acceptance evidence](docs/ACCEPTANCE.md) and [authorization record](docs/APPROVALS.md). CI/browser testing and an initial cloud operations run have succeeded; a real scheduled event is being verified.

Website: https://tapeshelf-reference.pages.dev

Repository: https://github.com/evanvenzor/tapeshelf-reference

## Run locally

Requires Node.js 22 or newer. Build, unit tests and deterministic operations need no package installation. For browser tests only, install pnpm 11.25.0, run `pnpm install --frozen-lockfile`, `pnpm exec playwright install chromium`, and `pnpm exec playwright test`. The browser suite runs on a free GitHub Linux runner; local browser testing is optional.

```sh
node --test test/catalog.test.mjs
node scripts/check.mjs
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173`. The test suite builds `dist/`. To rebuild without tests, use `node scripts/build.mjs`. Use a server for filtering; opening HTML directly from disk can block ES modules. Stop the preview with Ctrl+C.

```sh
node scripts/operations.mjs all
```

Runs deterministic data/site validation, source URL checks, deployment checks when authorized, a research queue, and an operating report. Output is in ignored `reports/`. An inaccessible source is an exception, not a successful verification. Source review is separate from HTTP checks.

## Architecture

| Location | Responsibility |
| --- | --- |
| `data/catalog.json` | Reviewed facts, evidence notes, dates and deliberate exclusions |
| `lib/catalog.mjs` | Scoped schema, URL validation, search and approval gates |
| `scripts/build.mjs` | Escaped static HTML, sitemap, robots, privacy/disclosures and SHA-256 manifest |
| `public/` | Mobile-first CSS and progressive search/filter behavior |
| `scripts/check.mjs` | Internal links/anchors, semantic markup, size budget and artifact hashes |
| `scripts/operations.mjs` | Bounded external checks, review queue, deployment integrity and honest reports |
| `.github/workflows/` | CI and scheduled daily/weekly operations, gated and active on approved free public runners |
| `test/` | Negative data tests, search/filter tests, approval and network failure cases |

Rendered records are available without JavaScript. No accounts, cookie banner, local storage or tracking scripts are included. All text is escaped at build time. Sources are allowlisted HTTPS hosts; redirect targets are validated before following them. Source checks have 15-second request limits and concurrency of two. The site has no server-side forms or secrets. A CSP restricts executable resources to the same origin.

## Scope and evidence

[Niche validation](docs/NICHE_VALIDATION.md) compares the automotive candidate with label-maker supplies and vacuum bags. It supports this bounded reference pilot, not a claim of validated economics. [Source register](docs/SOURCES.md) records factual provenance and exclusions. No traffic, search volume, revenue, physical testing, stock or affiliate approval is invented.

## Deployment and recovery

The initial build is `noindex,nofollow` and disallows crawling. Production building is deliberately blocked until `publicationApproved`, `hostingApproved`, `publicContactApproved`, the real HTTPS `siteUrl`, host name and host privacy URL are set **after explicit owner approval**. Do not use these switches to manufacture permission.

Owner-approved hosting: **Cloudflare Pages Free, static assets only**. Publication was approved in chat on 2026-11-18, and the owner completed Cloudflare authorization. This is a Direct Upload Pages project with no automatic deploy hook. Build the release with:

```sh
node --test test/catalog.test.mjs && node scripts/build.mjs --release && node scripts/check.mjs
```

Deploy the resulting `dist` directory with `wrangler pages deploy dist --project-name tapeshelf-reference --branch main --commit-hash <validated-commit>`. Wrangler must be authenticated through its own secure login. The initial release used Wrangler 4.164.0. The project already exists; do not recreate it. Direct Upload cannot later switch to Pages Git integration, but an explicitly approved CI upload can use Wrangler.

Output directory: `dist`. Node version: 22 or newer. No Functions, Workers paid plan, domain registration, paid add-ons or custom domains are needed. The owner approved a public repository, free standard GitHub runners, GitHub job summaries and public correction issues. Those repository settings are active. Account connection or terms acceptance must be handled with the owner's specific authorization. Do not configure auto-deployment until the owner approves its main-branch release policy. Build failure must prevent deployment.

Sites connector access was verified. It remains an alternative, but documented free hosting ends December 31, 2026; future overages and account allowance are unverified. No Site has been registered or deployed. GitHub Pages was rejected as the default because its published limits restrict using it to run an online business.

After a release, run `node scripts/operations.mjs all`. It compares the HTTPS bytes of every deployable file with the validated local manifest; an unexpected redirect, login page or mismatched artifact fails. Cloudflare's documented same-origin `.html` to extensionless redirect is verified explicitly. Deploy from the same revision used for the manifest. Avoid host HTML rewrites/minification that would invalidate byte checks, or explicitly verify the transformed artifact before changing the check.

Recovery: preserve the last successful Git commit and provider deployment. Revert a defective change with a new Git commit, rerun tests, then redeploy the last known-good revision using the provider's rollback controls. Never force-push or discard unrelated changes. Disable the provider's automatic deploy hook and the operations workflow if an integration malfunctions. Keep tokens in scoped repository/provider secrets, never in source or build output.

## Cloud operations

Scheduled daily checks: 09:23 UTC. Weekly report: Monday 10:37 UTC. Schedules are activated on GitHub-hosted Linux, independently of a laptop. A temporary 16:35 UTC trigger is only for initial acceptance and must be removed after evidence is captured. The weekly report also runs during daily checks so exceptions remain visible. The workflow has read-only repository permissions and an eight-minute timeout. It creates no commits, issues, emails or outbound messages. Reports go to the approved GitHub job summary; `reportDeliveryApproved` and `OPERATIONS_APPROVED=true` are now configured. Queue and exception details are available in the run logs. There are no artifact uploads or caches. Browser CI emits only bounded screenshots of this generated public site into its run log for inspection, avoiding separate artifact storage.

Actions use the approved public-repository free-runner path. The linked token could not inspect billing, so private runs have not been authorized or attempted. `ALLOW_PRIVATE_ACTIONS=true` is a separate gate, not a billing cap. Repository Actions is enabled after approval. Use the Actions tab to read the latest operations job summary. To run checks now: `gh workflow run operations.yml --repo evanvenzor/tapeshelf-reference`. To exercise both local and live browser behavior: `gh workflow run ci.yml --repo evanvenzor/tapeshelf-reference -f verify_live=true`. A manually dispatched run alone is not proof that a scheduled event ran.

GitHub schedules can be delayed or dropped under load, require the workflow on the default branch, and may be disabled after inactivity in a public repository. Review the last successful run; an absent report is not proof of health. GitHub run/log retention limits apply. A second alert-delivery channel would require separate approval and is outside V1.

## Costs and quotas

Target recurring cost: **$0**, with no spending authorized. The user's $25/month ceiling is not permission to incur charges.

- Cloudflare Pages Free documents 500 builds/month, one concurrent build, 20-minute build timeout and 20,000 files/site. This site contains 16 generated files and is about 55 KB uncompressed. These limits were rechecked on November 18, 2026; no account subscription was changed.
- Standard GitHub-hosted Actions are free in public repositories. Private allowances depend on plan and shared usage; actual remaining allowance and billing controls are unknown. No private jobs are enabled. Baseline estimate: about 35 operations runs/month; at an assumed 1–2 minutes/run, roughly 35–70 minutes, excluding development CI. The timeout bounds a pathological month to 280 minutes for those runs. This is an estimate, not a measurement or account quota.
- No paid model, data, analytics, domain, email or affiliate services are enabled. No artifact/cache storage is requested by these workflows. GitHub summaries/logs use repository retention policies.
- Sites is free through December 31, 2026 according to the documentation checked on November 18; over-allowance hosting may cost money starting January 1, 2027. It is not assumed permanently free.

Sources: [Cloudflare limits](https://developers.cloudflare.com/pages/platform/limits/), [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [GitHub schedules](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [Sites pricing](https://learn.chatgpt.com/docs/sites), [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Monetization, analytics and secrets

Affiliate mode is disabled. [Monetization plan](docs/MONETIZATION.md) documents Brother's Impact program and the pending eligibility/contract gate. Enabling requires accepted terms, explicit owner approval, the actual publisher ID, and exact approved retailer links/hosts. The code preserves supplied links instead of guessing tracking formats. Never scrape prices or build unapproved tracking URLs. Disclosure and `sponsored nofollow` are applied when links are activated.

Traffic analytics and hosted AI publishing are disabled. The weekly report labels missing visitors, search data, affiliate clicks, earnings and publication totals as **Unavailable**, never fabricated zero. Sitemap/canonical output and an optional Search Console verification token are prepared for an approved release. Index submission, account verification, analytics and collection remain pending approval; discovery or ranking is not guaranteed.

Unattended model-generated content is explicitly **blocked pending approved hosted execution, credentials, and a cost estimate**. The deterministic queue is not an AI researcher, and HTTP success is not semantic verification. No unverified content is automatically published. This satisfies the specification's permitted blocked-model path, not a claim of full autonomy.

Current required runtime secrets: none. Future scoped credentials, if approved, belong in GitHub/provider secrets. Never place API keys in `config.json`, static JavaScript, logs, source URLs or the repository.
