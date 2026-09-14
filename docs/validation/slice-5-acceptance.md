# Slice 5 acceptance: offline care reminders

- Care tasks are derived locally from crop placements and shared care profiles.
- The seven-day view includes recurring moisture observations and weekly health inspections.
- Recurrence is anchored to the planting date and remains deterministic across clients.
- Guidance tells users to inspect current conditions rather than blindly watering on a timer.
- Date-window validation prevents accidental unbounded task generation.
- Domain tests cover inclusive windows, recurrence anchors, stable ordering, and invalid inputs.
