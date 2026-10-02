# Engineering audit — 2026-10-02

## Scope and findings

Reviewed all shared domain modules/tests, React setup/planner flows, preview storage, native validators and SQLite persistence/migrations/export, Tauri configuration, CI, acceptance documents, open PRs, and branch ancestry against Horizon Ops engineering standards. No AGENTS.md was present. Preserve PARKED state and avoid new product slices.

The README described only slice 1 and the status document contained contradictory initial-refresh placeholders. Both now describe the implemented prototype and separate planned beta scope from verified evidence.

## Correctness fixes

- Five record validators previously accepted either any date-shaped string or JavaScript dates that normalize impossible days (for example February 30). One shared strict calendar-date boundary replaces duplicate helpers and rejects normalized dates; care and harvest projections reuse it.
- Browser placement endings previously allowed missing placements and dates before planting. The existing storage adapter now validates/normalizes lifecycle input, requires the placement, and enforces chronology. Original end events remain immutable/idempotent and placement history remains intact.
- Invalid dates and failed endings produce explicit errors and do not store a lifecycle event. Existing malformed preview records are not silently rewritten.

## Validation and review

- Local `pnpm install --frozen-lockfile` completed with Node 24; available local pnpm was 11.25.0, while hosted CI uses the repository pin 10.19.0.
- `pnpm check`: lint, strict TypeScript, 51 tests, domain build, and production Vite build passed.
- Running the date regressions against the original modules produced six failures; restoring the fixes made all 16 focused date/storage tests pass.
- Local Chromium smoke passed setup, crop placement, harvest/observation recording, rejected pre-plant ending, valid ending, reload persistence, reminder suppression, and JSON backup relationship IDs. This used a temporary browser outside repository dependencies and does not assert native UI acceptance.
- New regression cases cover impossible/leap dates at every record boundary, malformed formats, schedule rejection and leap-day projection, missing placements, pre-plant endings, normalization, immutable endings, and retained history.
- Separate diff review checked the actual edits for duplication, hidden failures, speculative abstractions, and scope. One dates module replaces duplicated date handling; no new service architecture or dependencies.
- Native Rust was unavailable in the local environment. Existing hosted CI validates native tests and Clippy on Linux, Windows, and macOS; exact audit-head CI #42 passed all four jobs (51 frontend tests and 10 native tests per platform, plus lint/build checks). PR #14 merged after actual diff review; post-merge main verification is tracked in STATUS.md and Horizon Ops.

## Deferred work

No packaged UI/device acceptance or release assertion. Mobile, sync, spacing/layouts, import/restore, complete beta scope, and Rust dependency/toolchain pinning remain deferred. None is a current owner action while parked.

## Branch safety

All 13 historical non-main branches diverge from pre-audit main. Slices appear implemented on main, but branch ancestry alone cannot establish preservation of every unique commit. Retain them for content/PR-history review. No branches deleted.
