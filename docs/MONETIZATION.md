# Monetization gate

No affiliate application, agreement, outreach, link activation or purchase was performed.

Preferred candidate: [Brother Affiliate Partner Program](https://www.brother-usa.com/become-an-affiliate), via Impact, program ID 10836. The public page checked November 18, 2026 advertises a baseline CPA of 5%; that is not an accepted rate or an earnings estimate. Eligibility, geographic/account requirements, payout/tax requirements and the actual contract must be reviewed in the application flow. They have not been accepted or fully inspected behind login.

Do not submit the application merely to discover terms. Obtain the owner's approval for the particular application/contract step. No revenue is forecast.

## Prepared integration

`config.json` defaults to `affiliate.enabled=false`. Manufacturer links remain unpaid evidence links. To enable later, all of the following are required:

1. Explicit owner approval to enter the specific agreement and confirmation that the program accepted the site.
2. Actual publisher identifier and exact program-issued/approved link URLs for the specific products. Do not guess an Impact URL format or affiliate tag.
3. Explicit allowlist of those link hosts; only HTTPS URLs without embedded credentials are accepted.
4. Current program disclosure requirements checked against `disclosure.html` and adjacent link text.
5. Tests/build rerun, approved release, and click-through inspection of the exact destinations.

Activated links are labeled “Retailer (affiliate)” and use `rel="sponsored nofollow noopener noreferrer"`. No price feed, product images or tracking script is included. If current terms require a different disclosure, update it before activation.

Alternative only: [Amazon Associates application review](https://affiliate-program.amazon.com/help/node/topic/G8TW5AE9XL2VX9VM) requires qualifying sales and substantive original public content. The published review process calls for at least three qualifying sales within 180 days and suggests at least ten posts as a content guideline. This small utility is not assumed eligible. Do not pad the site with thin posts or apply automatically. Amazon integration is not active and its required associate identification must not be falsely asserted before membership.

Affiliate reporting, attributed earnings and outbound click measurement are unavailable. The weekly report explicitly labels them that way. A later reporting integration requires approval, credentials and provider-specific terms review.
