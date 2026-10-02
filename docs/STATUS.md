---
status_schema_version: 1
project: "Horizon Garden"
portfolio_state: PARKED
current_phase: FOUNDATION_PROTOTYPE_PARKED
release_target: null
last_reviewed: 2026-10-02
last_known_good_commit: "2f931f25959047ba94bcad2ffff5a7e183611197"
ci_state: PASS
deployment_state: NOT_CONFIGURED
owner_action_required: false
owner_action_count: 0
assistant_actionable: false
status_confidence: HIGH
---

# Project Status

Repository-level operational source of truth. Horizon Ops assigns portfolio execution priority.

## Current objective and phase

Preserve the parked local-first desktop prototype. This bounded engineering/documentation audit fixes existing date and preview lifecycle behavior; it does not authorize new product slices or a release.

`FOUNDATION_PROTOTYPE_PARKED`

## Last known good and CI

- Pre-audit main: `2f931f25959047ba94bcad2ffff5a7e183611197`.
- Verified hosted CI #41: [run 36313127696](https://github.com/horizon-tech-development/horizon-garden/actions/runs/36313127696), success on the exact pre-audit main; frontend validation plus native tests/Clippy on Linux, Windows, and macOS.
- Audit local validation: lint, strict TypeScript, 51 domain/storage tests, production frontend build, and diff review passed. Cross-platform audit CI must pass before merge; final evidence will be recorded after merge.
- Deployment/packaged release: not configured or verified by this audit. No release target.

## Implemented behavior

One editable rectangular growing area; five area types; unit normalization and area/volume calculations; starter catalog/filtering and placements; companion guidance; harvest estimates; recurring care and history; harvest/observation records; JSON export; immutable placement lifecycle. See [FOUNDATION.md](FOUNDATION.md).

## Known limitations and release blockers

- The complete beta garden loop is unfinished: multiple areas/layouts, spacing validation, mobile, sync/roles, sourced catalog expansion, and transactional restore/import remain deferred.
- Native tests/Clippy compile the backend; packaged UI, installer, restart persistence, and physical-device acceptance are not established.
- Browser localStorage is a separate preview store and uses UUIDv4; native data uses SQLite and UUIDv7. Existing malformed preview data is not silently repaired.
- Rust dependencies currently have no committed Cargo.lock and use the stable toolchain; native CI resolution is not fully reproducible. Pinning/update policy is follow-up work before a release.
- No current engineering blocker to preserving the parked prototype.

## Owner actions required

None. Hands-on release acceptance becomes relevant only if the project is explicitly resumed toward a release; it is not a current owner queue item.

## Assistant-actionable work and next tasks

No ongoing product work while parked. When resumed: establish release scope, dependency pinning/update policy and native persistence/UI acceptance, then address deferred beta requirements. Do not infer authorization from historical feature branches.

## Branch and PR state

At audit start: 14 branches, no open PRs. All 13 non-main historical branches are divergent from pre-audit main (including the status branch). Implemented slices overlap their names but ancestry does not prove full preservation. Retain all branches pending content/PR-history review; none deleted. The audit adds one branch.

## Audit record

[Engineering audit — October 2](validation/engineering-audit-20261002.md).

## Operating rules

Repository evidence outranks chat recollection. Refresh this file after meaningful milestones. Compilation and code existence do not establish release acceptance. Keep owner actions minimal; maintain parked scope until explicitly resumed.
