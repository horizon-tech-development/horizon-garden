# Slice 8 acceptance: garden observation journal

- A user can record an append-only observation against an existing crop placement.
- Entries distinguish general, growth, pest, disease, damage, and weather observations.
- Condition is recorded as normal, watch, or action needed without asserting diagnosis or resolution.
- Observation date and meaningful notes are required.
- Desktop preview and Tauri SQLite persistence follow the same behavior.
- SQLite migration v5 is idempotent and preserves all earlier records.
- Shared-domain and native-boundary tests reject invalid dates, kinds, conditions, notes, and missing placements.
