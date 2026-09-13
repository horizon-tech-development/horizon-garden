# Slice 2 acceptance: starter catalog and crop placement

Slice 2 adds the first useful planning loop while remaining completely offline.

## Required behavior

- Browse a bundled starter catalog without a network connection.
- Search by common name, scientific name, or plant family.
- Filter by growing season and environment.
- View spacing and days-to-harvest guidance for every entry.
- Select a plant and record quantity, planting date, and optional notes.
- Associate each placement with the durable growing-area identifier.
- Persist placements in SQLite in the packaged desktop app.
- Preserve a local-storage adapter for browser-based UI development.
- Reject unknown plants, invalid dates, invalid quantities, missing areas, and oversized notes at the shared and native boundaries.
- Apply database migration version 2 idempotently.

Companion relationships, spatial coordinates, capacity warnings, varieties, and sourced catalog provenance remain subsequent slices.
