# Delivery review · v0.1

2026-11-04. Independent read-only reviewer: Herschel. Scope: this new project, the user's goal, requirement provenance, local data safety, import/export and result review. No card-learning code, data, credentials, or release touched.

| Finding                                                                                                                       | Correction                                                                                                                    | Evidence                                                             |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Imported long names and 121st notes could create records the app could not reopen                                             | Bound import name, cap notes, validate metadata before writes, isolate unreadable records and offer their raw recovery export | Browser test: 120-character export/import + corrupt record isolation |
| Slow media upload could restore an old project snapshot over new edits                                                        | Merge upload into the latest project by stable project identity                                                               | Browser test: delayed FileReader while editing directives            |
| Earlier save completion could report success while newer saves remained pending; another project's success could hide failure | Save queue tracks pending operations and failed project identities                                                            | Two queue unit tests                                                 |
| Review handoff lost avoid/keep intent, reasons and asset positions                                                            | Preserve rule title, stable ID, original reason, file and position/time in UI and revision export                             | Core provenance test + complete workflow                             |
| “Neither” rejected samples vanished from acceptance checks                                                                    | Preserve explicit rejection as a reviewable constraint; alternative stays open                                                | Core unknown/rejection test                                          |

Additional main-agent corrections: hidden upload inputs overrode native hidden display; low-contrast supporting copy; mobile access to project settings; video-frame payloads excluded from review fingerprints; phone brief shown before export controls. All synthetic test assets are project-authored.

Review is not a claim of user satisfaction or physical iPhone testing. Final verification and release identity are maintained only in STATUS.md.

Independent recheck: Herschel reran all 16 core tests and the five original minimal reproductions. All five blockers resolved within the reviewed scope. Main-agent browser acceptance additionally passed all ten cases in Chromium and phone WebKit, against both development and production builds.

Public-site acceptance: the same ten browser workflows passed at https://easin-yx.github.io/taste-align/ after release, including image/video export and restore. No user data was used; each test ran in an isolated browser context.
