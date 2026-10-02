# Slice 1 acceptance gates

Current audit evidence is in [STATUS.md](../STATUS.md) and [the October 2 audit](engineering-audit-20261002.md). The checklist below records required acceptance; unchecked native interaction/restart gates are not established by compile/test CI.

- [ ] Workspace, property, garden, and all five growing-area types can be created in the packaged UI.
- [ ] Rectangle length, width, and depth accept supported units in the packaged UI.
- [x] Domain tests verify area and soil-volume calculations and invalid dimension rejection.
- [ ] SQLite data remains after closing and reopening the packaged app.
- [ ] Editing preserves durable entity IDs in a native session.
- [x] Native tests verify new-database migration and repeat-migration idempotency.
- [x] Lint, type checks, tests, and frontend build pass.
- [ ] Linux Tauri application launch acceptance.
- [ ] Windows and macOS packaged UI/installer acceptance.

Browser smoke verification covers setup, placement, activity records, lifecycle, reload persistence, and backup export. Native tests/Clippy establish backend compile/test compatibility across Linux, Windows, and macOS, not packaged runtime acceptance. Existing-database upgrade acceptance remains a separate persistence gate.

Mobile, synchronization, catalog content, and visual crop placement are not part of Slice 1.
