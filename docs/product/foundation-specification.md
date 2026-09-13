# Horizon Garden product foundation

This repository implements the approved Horizon Garden foundation. The complete planning record is retained in the project artifact; the durable implementation requirements are summarized here.

## Product

Horizon Garden is an all-in-one, privacy-conscious system for planning and managing raised beds, in-ground plots, containers, greenhouse areas, and indoor growing boxes. It covers catalog knowledge, layouts, schedules, companions, care, observations, problems, inventory, harvest, preservation, reports, and later sensors and optional AI.

## Architecture

- Independent offline-first desktop and mobile applications
- SQLite on each client
- Optional self-hosted or Horizon-hosted synchronization
- Identical owner, gardener, and viewer roles in hosted and self-hosted modes
- Complete export and migration without cloud lock-in
- TypeScript shared domain logic with platform persistence adapters

## First usable beta

The beta must complete a full garden loop: create growing areas, browse a sourced catalog, place crops, validate spacing, recommend companions, schedule work, record garden activity and harvests, operate offline on desktop and Android, synchronize through a self-hosted server, and export or back up data.

## Slice 1

Slice 1 is limited to the foundational desktop workflow and acceptance gates documented in `docs/validation/slice-1-acceptance.md`.
