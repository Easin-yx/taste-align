# Delivery and next-step status

## v0.2.0 · 2026-11-16

The main comparison workspace now opens on four complete versions of the same mobile exhibition guide. All four use the same original Paper Court artwork and content. Each has three coordinated palettes. Exploring a candidate is temporary. Only final confirmation attaches the whole sample to the current project. Users can skip, withdraw, switch to the earlier detail comparisons, export, restore, and review.

A confirmed bundle contains the exact displayed PNG, the offline HTML specimen, the author's recipe, the brief and an editable project. The confirmed scope is this mobile exhibition screen. A choice does not establish an independent preference for every visual parameter or validate motion, other content or another product. Project-wide preferences and other references can still be specified separately.

Local production build: 28 unit tests and 14 desktop Chromium / phone-sized WebKit browser workflows passed, including exact preview-to-export PNG equivalence, cancellation, reload and withdrawal. All twelve scheme variants round-trip through the bundle.

**Next validation:** give the same new screen task to an independent recipient with and without the handoff. Compare the results blind, record which is closer and how many corrections it needs. Real-user value, physical iPhone use and cross-content transfer remain unverified. Further map questions and motion are pending.

## Prior specification work (through 2026-11-10)

The question definitions, proposed extensions and research are maintained in [QUESTION-DEFINITIONS.md](QUESTION-DEFINITIONS.md), [AESTHETIC-MAP.md](AESTHETIC-MAP.md) and [RESEARCH.md](RESEARCH.md). The following verification notes describe earlier rounds.

## Design-handoff specification verification — 2026-11-10

Independent read-only reviewer Hume reported no substantive document-level issue in scope, status, fictional evidence or whole-instance inference. Main-agent checks passed for local links, table columns, UTF-8, all seven question mappings and patch whitespace. Existing export filenames were verified in src/core/export.ts. No runtime tests, real handoff trial, sample rendering or deployment occurred. The next evidence needed is a real selected sample plus recipe and recipient implementation, as specified in DESIGN-HANDOFF.md.

## Whole-scheme question revision verification (v0.2 spec) — 2026-11-06

Independent read-only reviewer Laplace found one scope ambiguity: section 10 still described future implementation as the current round. The main agent explicitly separated the future implementation plan from this documentation-only revision. No other substantive document-level issue was reported. Local Markdown link targets, table columns and patch whitespace passed checks. This round did not recheck papers, create samples, run application tests, deploy, or validate real-user aesthetic outcomes. See COHERENCE-01 in [workflow-review.md](workflow-review.md).

## Historical question-definition verification (v0.1 spec, superseded) — 2026-11-06

P0's first written definitions were reviewed by independent read-only reviewer Huygens: no blocking document-level gap found in research/inference boundaries, context dependencies, overall confirmation or question budget. The main agent checked primary-source descriptions, local links, table structure, all eight question sections and patch whitespace. No new runtime tests, samples, deployment or physical iPhone checks occurred. These old candidates were uncalibrated and have since been replaced by the v0.2 plan. This historical review does not validate aesthetic effectiveness or the revised plan.

## Development-plan verification — 2026-11-06

The P0–P7 plan was checked for local links, table structure and patch whitespace. Independent read-only reviewer Noether identified two planning gaps: old open v0.1 tabs can overwrite shared project records, and early human calibration versus final validation lacked evidence-reuse rules. The main agent verified the current storage write behavior and added cross-version isolation/deletion tests, versioned calibration reuse and external-resource boundaries. This is a corrected plan, not a runtime fix or a completed user study. Application code and deployment remain unchanged.

## Documentation verification — 2026-11-06

Local links, table structure and patch whitespace passed checks. Independent read-only reviewer Carson found one inherited rule incorrectly fixing layout/type across all question types; the main agent changed it to question-specific controls, preserving the intended test variables. The review covered document consistency and scope, not a full paper audit or runtime effectiveness. See VISUAL-01 in [workflow-review.md](workflow-review.md).

## Historical documentation verification — 2026-11-05

Local Markdown link targets, table structure and patch whitespace were checked. One independent read-only reviewer (Jason) identified two interaction ambiguities: confirming a sample before its usage scope is known, and losing a hovered candidate when moving to the confirm button. The main agent resolved both in the feature/design documents and cross-checked the revised wording. Details and remaining runtime validation are in [workflow-review.md](workflow-review.md). No runtime tests or physical-device checks were performed for this documentation-only change.

## Existing v0.1 delivery

Implemented in a separate repository: same-content comparisons; scoped reference image/video notes with automatic video stills; portable AI brief/asset bundles; editable backup import; manual result review and stale-approval invalidation; project lifecycle; Chinese/English; local-only storage.

## Runtime verification — 2026-11-04

- Production TypeScript/Vite build: passed.
- 16 core tests: passed, including unknowns, explicit rejection, evidence, complete bundle round-trips, invalid input, stale approvals, video stills and queued save status.
- 10 browser tests: passed in desktop Chromium and phone-sized WebKit. Coverage: complete compare→annotate→export→import→review, corrupt import, 320/375/390/768/1440 overflow, keyboard/dialog, WCAG A/AA automated checks on the comparison screen, video still/timestamp export, 120-character project-name import, corrupt-record isolation, edits during slow uploads.
- Runtime dependency audit: zero reported vulnerabilities at verification time.
- Independent read-only review: five concrete issues identified and fixed, then independently rechecked with no remaining blocking finding; see workflow-review.md.
- Public source: https://github.com/Easin-yx/taste-align (MIT). Online: https://easin-yx.github.io/taste-align/ . All ten browser workflows passed against this public URL in Chromium and phone WebKit. Published build source: ecd9ce4312656c6a8942bd73b62eb4531d801889.

## Deliberate boundaries

Physical iPhone Safari/system keyboard/share behavior has not been verified. Phone-sized WebKit is automated desktop testing, not a real iPhone.
Real-user speed or satisfaction improvements are unproven. The tool makes evidence and scope explicit; it does not diagnose taste or guarantee AI output quality.
No automatic AI image analysis, model calls, cloud sync, multiplayer, or in-app full UI generation.
The live v0.1 five sample pairs offer a limited starting vocabulary; they do not yet implement the new visual-only question sequence. Optional user references remain available. The proposed sequence's coverage and effectiveness remain unverified.

## Rollback and handoff

First release: v0.1.0. Source and release branches are archived publicly. Future changes can be reverted and republished with `npm run publish:pages` without changing the URL. Local browser projects use schema version 1; this release does not migrate another application’s data.

Published HTML and `release.json` were fetched successfully. The public page was also opened and visually inspected in the in-app browser.
