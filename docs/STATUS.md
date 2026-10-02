---
status_schema_version: 1
project: "Horizon Garden"
portfolio_state: PARKED
current_phase: FOUNDATION_PROTOTYPE_PARKED
release_target: null
last_reviewed: 2026-10-02
last_known_good_commit: "6757a96df6f77bc34fc6c6952683c1536615a0fc"
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
- Audit PR [#14](https://github.com/horizon-tech-development/horizon-garden/pull/14) merged as `bdedffb7057128d17ec2ca96bb3cf5228ac23744` after exact-head CI [#42 / 36997773151](https://github.com/horizon-tech-development/horizon-garden/actions/runs/36997773151) passed on `6757a96df6f77bc34fc6c6952683c1536615a0fc`.
- CI #42 verified 51 domain/storage tests, lint, strict TypeScript, production frontend build, and 10 native tests plus Clippy on each of Linux, Windows, and macOS. The front-matter last-known-good records that verified audit head; the merge carries the same reviewed implementation.
- Local Chromium smoke passed setup, placement, harvest/observation records, rejected pre-plant ending, valid ending, reload persistence, reminder suppression, and backup relationship IDs.
- Post-merge documentation refresh runs the same [main CI workflow](https://github.com/horizon-tech-development/horizon-garden/actions?query=branch%3Amain); final head/run evidence is also maintained in Horizon Ops.
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

At audit start: 14 branches, no open PRs. All 13 non-main historical branches are divergent from pre-audit main (including the status branch). Implemented slices overlap their names but ancestry does not prove full preservation. Retain all branches pending content/PR-history review; none deleted. The audit adds one branch, now merged and ancestry-contained by main. Total: 15 branches; no open audit PR.

## Audit record

[Engineering audit — October 2](validation/engineering-audit-20261002.md).

## Operating rules

Repository evidence outranks chat recollection. Refresh this file after meaningful milestones. Compilation and code existence do not establish release acceptance. Keep owner actions minimal; maintain parked scope until explicitly resumed.
