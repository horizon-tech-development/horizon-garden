# Horizon Garden

Horizon Garden is an offline-first garden planning prototype built with React, shared TypeScript domain logic, and Tauri/SQLite. Desktop is the implemented target; mobile and optional synchronization remain planned.

## Current status

**PARKED · FOUNDATION_PROTOTYPE_PARKED.** No owner action is currently required. Operational evidence and deferred work are maintained in [docs/STATUS.md](docs/STATUS.md).

The current prototype includes:

- One editable workspace → property → garden → rectangular growing area, supporting five area types and US customary/metric input normalized to millimeters
- Area and soil-volume calculations, SQLite persistence, and native UUIDv7 identities preserved across setup edits
- An eight-plant starter catalog, search/filters, crop placement, and companion guidance with evidence labels and cautions
- Estimated harvest windows and recurring moisture/health reminders
- Completed/skipped care history, measured/count harvests, and an observation journal
- Append-only, idempotent placement endings that preserve history and suppress reminders after the end date
- Versioned JSON export including relationship IDs and lifecycle events

Browser preview stores records in localStorage and downloads backups; the native app stores SQLite data and writes backups under its application data directory. Preview IDs currently use UUIDv4. Restore/import, mobile, sync, spacing validation, and a packaged release are not implemented or verified.

## Development

Use Node.js 24 and the pinned pnpm 10.19.0:

    pnpm install --frozen-lockfile
    pnpm check

`pnpm check` runs lint, strict TypeScript, all domain/storage tests, and the production frontend build. CI additionally runs Rust tests and Clippy on Linux, Windows, and macOS.

Native development requires Rust and the Tauri prerequisites for the target OS:

    pnpm --filter @horizon-garden/desktop tauri dev
    cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
    cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml -- -D warnings

See [docs/FOUNDATION.md](docs/FOUNDATION.md), [acceptance records](docs/validation), and the [engineering audit](docs/validation/engineering-audit-20261002.md). Native compile/test CI does not establish packaged UI or physical-device acceptance.

## Project operations

Horizon Ops coordinates effective portfolio priority and branch hygiene. Garden remains parked; this bounded audit does not activate product development. Branch age or naming alone is never sufficient reason to delete a branch.
