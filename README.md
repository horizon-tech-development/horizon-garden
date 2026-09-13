# Horizon Garden

Horizon Garden is an offline-first garden planning and management platform for desktop and mobile. It is designed for raised beds, in-ground plots, containers, greenhouse areas, and indoor growing boxes, with optional self-hosted or managed synchronization.

## Current status

Slice 1 establishes the Windows/Linux desktop foundation:

- Workspace, property, garden, and growing-area hierarchy
- All five initial growing-area types
- Rectangle dimensions in US customary or metric units
- Area and soil-volume calculations
- SQLite persistence in the Tauri application
- Durable UUIDv7 record identities

Plant catalog, crop placement, mobile, and synchronization follow in later slices.

## Development

Requirements for shared and frontend checks:

- Node.js 24
- pnpm 10 or newer

Run:

    pnpm install
    pnpm check

Native desktop development also requires the Rust and Tauri system prerequisites for the target operating system.

    pnpm --filter @horizon-garden/desktop tauri dev

See `docs/FOUNDATION.md` and `docs/validation/slice-1-acceptance.md` for the approved scope and current gates.
