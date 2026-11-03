# v0.1 delivery status

Date: 2026-11-04

Implemented in a separate repository: same-content comparisons; scoped reference image/video notes with automatic video stills; portable AI brief/asset bundles; editable backup import; manual result review and stale-approval invalidation; project lifecycle; Chinese/English; local-only storage.

## Verification

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
The five sample pairs offer a starting vocabulary. User references and explicit instructions remain essential for distinct art direction.

## Rollback and handoff

First release: v0.1.0. Source and release branches are archived publicly. Future changes can be reverted and republished with `npm run publish:pages` without changing the URL. Local browser projects use schema version 1; this release does not migrate another application’s data.

Published HTML and `release.json` were fetched successfully. The public page was also opened and visually inspected in the in-app browser.
