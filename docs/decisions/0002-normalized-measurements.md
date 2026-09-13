# ADR 0002: Normalize geometry to integer millimeters

## Status

Accepted

## Decision

Store authoritative linear measurements as positive integer millimeters. Preserve the user's display-unit preference separately. Derive area and volume from normalized dimensions.

## Consequences

- Calculations do not depend on binary floating-point storage.
- Metric and US customary display can share one geometry model.
- The initial 1 mm precision is sufficient for garden layout work.
