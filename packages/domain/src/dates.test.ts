import { describe, expect, it } from "vitest";
import { isDateOnly, parseUtcDate } from "./dates.js";
import { validateCropPlacement } from "./catalog.js";
import { validateCareResult } from "./care-history.js";
import { validateHarvestRecord } from "./harvests.js";
import { validateGardenObservation } from "./observations.js";
import { validatePlacementLifecycleEvent } from "./placement-lifecycle.js";
import { buildCareSchedule } from "./care.js";
import { projectHarvestWindow } from "./schedules.js";

const placement = { id: "p1", growingAreaId: "a1", plantId: "plant-lettuce", quantity: 1, plantedOn: "2026-05-01", notes: "", createdAt: "2026-05-01T00:00:00Z" };
const boundaries = [
  { name: "placement", validate: (date: string) => validateCropPlacement({ ...placement, plantedOn: date }) },
  { name: "care result", validate: (date: string) => validateCareResult({ taskId: "task", placementId: "p1", kind: "moisture-check", dueOn: date, status: "completed", notes: "" }) },
  { name: "harvest", validate: (date: string) => validateHarvestRecord({ placementId: "p1", harvestedOn: date, amount: 1, unit: "count", notes: "" }) },
  { name: "observation", validate: (date: string) => validateGardenObservation({ placementId: "p1", observedOn: date, kind: "general", condition: "normal", notes: "Healthy" }) },
  { name: "lifecycle", validate: (date: string) => validatePlacementLifecycleEvent({ placementId: "p1", endedOn: date, reason: "removed", notes: "" }) }
];

describe("calendar dates", () => {
  it.each(["2026-02-29", "2026-02-30", "2026-04-31", "2026-13-01", "2026-00-01", "2026-1-01", "2026-01-01T00:00:00Z", "today"])("rejects %s without normalizing it", (value) => {
    expect(isDateOnly(value)).toBe(false);
    expect(() => parseUtcDate(value)).toThrow(/date/i);
    for (const boundary of boundaries) expect(() => boundary.validate(value), boundary.name).toThrow(/date/i);
  });
  it.each(["2024-02-29", "2000-02-29", "2026-04-30", "2026-12-31"])("accepts %s at every record boundary", (value) => {
    expect(parseUtcDate(value).toISOString().slice(0, 10)).toBe(value);
    for (const boundary of boundaries) expect(() => boundary.validate(value), boundary.name).not.toThrow();
  });
  it("rejects impossible dates when scheduling existing placements", () => {
    const invalid = { ...placement, plantedOn: "2026-02-30" };
    expect(() => buildCareSchedule([invalid], "2026-03-01")).toThrow(/date/i);
    expect(() => buildCareSchedule([placement], "2026-04-31")).toThrow(/date/i);
    expect(() => projectHarvestWindow(invalid)).toThrow(/date/i);
  });
  it("projects across a leap day without using the local timezone", () => {
    expect(projectHarvestWindow({ ...placement, plantedOn: "2024-02-29" }).earliestHarvestOn).toBe("2024-03-30");
  });
});
