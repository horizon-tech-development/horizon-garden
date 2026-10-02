# Horizon Garden foundation

The product direction is summarized in [product/foundation-specification.md](product/foundation-specification.md); it includes future beta requirements beyond the current prototype.

## Implemented prototype

- Slice 1: one editable workspace/property/garden/growing-area hierarchy, five area types, rectangular millimeter dimensions, calculations, SQLite persistence, native UUIDv7 identities
- Slice 2: bundled eight-plant catalog and crop placements
- Slice 3: directional companion guidance with evidence labels and cautions
- Slice 4: estimated harvest windows
- Slices 5–6: recurring moisture/health reminders and completed/skipped care history
- Slices 7–8: harvest records and observation journal
- Slice 9: versioned JSON export; restore/import excluded
- Slice 11: append-only placement endings, preserved history, and suppression of later reminders

Acceptance records are in [validation](validation). The October 2 audit consolidates strict calendar-date validation and brings browser ending chronology in line with native behavior.

## Persistence boundary

Tauri commands validate input and persist to SQLite with foreign keys and six idempotent schema versions. The browser preview uses localStorage so frontend development can run outside Tauri; it is a separate preview store, not a native migration or synchronization mechanism. Native record IDs use UUIDv7; preview records currently use UUIDv4.

## Deferred beta scope

Multiple growing areas/layout editing, sourced catalog expansion, spacing checks, Android/mobile, synchronization and roles, import/restore, packaged installer verification, and the complete first-beta garden loop remain deferred. See [STATUS.md](STATUS.md) for current operational evidence. The project remains parked.
