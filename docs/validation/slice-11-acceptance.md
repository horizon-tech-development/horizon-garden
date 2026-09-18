# Slice 11 acceptance — crop placement lifecycle

- PASS: a crop placement can be ended as harvest complete, crop failed, removed, or season ended.
- PASS: the end event is append-only and idempotent; ending the same placement again returns its original event.
- PASS: the end date cannot precede the planting date at the native boundary.
- PASS: historical placements, harvests, observations, and care results remain available.
- PASS: reminders after the placement end date are suppressed while reminders on that date remain visible.
- PASS: ended placements no longer appear in the current estimated harvest schedule.
- PASS: lifecycle events persist in browser preview storage and SQLite migration v6.
- PASS: portable JSON backups include lifecycle events and their placement relationship IDs.
- PASS: lint, strict TypeScript, 31 domain tests, and production build pass locally.
- WARN until CI: native Rust tests and lint on Linux, Windows, and macOS.
- WARN until hands-on test: native UI interaction and persistence across restart.
