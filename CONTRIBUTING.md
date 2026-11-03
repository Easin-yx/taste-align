# Contributing

## Start

Use Node 24 LTS, `npm ci`, and `npm run dev`. Keep PRs focused. Include the user problem and before/after behavior, not only implementation details.

Before a PR: `npm test`, `npm run build`, and the relevant Playwright workflows. UI changes need desktop and narrow-mobile screenshots with original/synthetic data only.

## Protect the product

- Unknown preferences must stay unknown. Never infer approval from a default.
- Each comparison changes one dimension; do not change content to make one option look better.
- Requirements need evidence/provenance and a way to edit/retract them.
- References stay local unless a user explicitly exports them. No analytics or external asset calls by default.
- Do not add fake AI analysis, aesthetic scores, provider keys, or remote image scraping.
- Imported data is untrusted. Do not execute asset text, HTML, scripts, or archive paths.
- A changed requirement or result invalidates old acceptance.
- Preserve data and keyboard/touch access. No iPhone claims based only on desktop emulation.

Please discuss a new hosted backend, model dependency, or multiplayer scope before implementing it. No CLA is required; contributions are under MIT.
