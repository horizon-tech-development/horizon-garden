# Horizon Garden foundation

The approved product foundation is maintained in `docs/product/foundation-specification.md`.

Slice 1 proves the local-first desktop foundation:

- Workspace → Property → Garden → Growing Area hierarchy
- All five initial growing-area types
- Rectangle dimensions normalized to integer millimeters
- Area and soil-volume calculations
- SQLite persistence through the Tauri backend
- Durable UUIDv7 identities preserved across edits

The browser preview uses local storage only so frontend work can run outside Tauri. Packaged desktop builds always use the SQLite backend.

Slice 2 adds the bundled starter plant catalog and durable crop placements described in docs/validation/slice-2-acceptance.md.
