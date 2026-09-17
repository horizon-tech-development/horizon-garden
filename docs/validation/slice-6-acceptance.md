# Slice 6 acceptance: local care history

- A generated reminder can be recorded as completed or explicitly skipped.
- Recording an observation never implies that watering, treatment, or another physical action occurred.
- Resolving one reminder hides only that exact occurrence; future recurrence remains scheduled.
- Results retain the task identity, placement, kind, due date, status, notes, and recording time.
- Saving the same task twice is idempotent and cannot create duplicate history.
- Desktop preview and Tauri SQLite persistence follow the same behavior.
- SQLite migration v3 is idempotent and preserves existing setup and placement data.
- Domain tests cover normalization, exact-occurrence filtering, skipped results, and invalid inputs.
