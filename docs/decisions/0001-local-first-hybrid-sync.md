# ADR 0001: Local-first clients with replaceable synchronization

## Status

Accepted

## Decision

Desktop and mobile clients keep complete local databases and remain useful offline. Synchronization is optional and may target a Horizon-hosted service, a remotely accessible self-hosted service, or a local-network-only self-hosted service. Hosted and self-hosted modes use the same server core and authorization rules.

## Consequences

- Cloud availability is not required for field use.
- Synchronization must tolerate long offline periods and preserve conflicts.
- Sync is not a backup; each deployment requires an independent backup strategy.
