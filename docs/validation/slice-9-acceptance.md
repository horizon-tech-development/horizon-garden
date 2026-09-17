# Slice 9 acceptance: portable JSON backup

- A user can explicitly export a versioned JSON backup without network access.
- The backup includes setup hierarchy, crop placements, care results, harvests, and observations.
- Native desktop backups are written beneath the application data directory in an `exports` folder.
- Browser preview downloads the same logical payload without accessing the native filesystem.
- The file includes a stable format name, format version, and UTC export timestamp.
- Export is read-only and cannot mutate or delete garden records.
- Restore/import is intentionally excluded until schema validation and transactional rollback are implemented.
