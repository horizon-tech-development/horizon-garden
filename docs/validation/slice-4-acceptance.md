# Slice 4 acceptance: harvest schedule projection

## Required behavior

- Derive an earliest and latest harvest date from each crop placement.
- Use the catalog maturity range without requiring a network connection.
- Perform calendar arithmetic in UTC to avoid daylight-saving date shifts.
- Sort the schedule by earliest projected harvest.
- Label all projected dates as estimates rather than promises.
- Preserve the original planting date and crop identity in every schedule item.
- Reject unknown catalog plants and invalid planting dates.

Regional frost windows, transplant dates, succession planting, care tasks, reminders, and observed harvest corrections remain later scheduling work.
