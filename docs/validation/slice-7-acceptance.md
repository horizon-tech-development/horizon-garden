# Slice 7 acceptance: actual harvest records

- A user can record a harvest against an existing crop placement.
- Each entry retains the harvest date, positive amount, supported unit, notes, and recording timestamp.
- Supported units are count, grams, kilograms, ounces, and pounds.
- Count entries require whole numbers; measured units may use decimals.
- Multiple harvests can be recorded for the same crop without closing the placement.
- Desktop preview and Tauri SQLite persistence follow the same behavior.
- SQLite migration v4 is idempotent and preserves setup, placements, and care history.
- Shared-domain and native-boundary tests reject invalid dates, amounts, units, notes, and missing placements.
