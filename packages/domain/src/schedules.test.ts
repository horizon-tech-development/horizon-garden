import { describe, expect, it } from "vitest";
import { buildHarvestSchedule, projectHarvestWindow } from "./schedules.js";
import type { CropPlacement } from "./catalog.js";

const placement = (id: string, plantId: string, plantedOn: string): CropPlacement => ({ id, plantId, plantedOn, growingAreaId: "area-1", quantity: 1, notes: "", createdAt: `${plantedOn}T12:00:00.000Z` });

describe("harvest schedule", () => {
  it("projects an inclusive estimated maturity range in UTC", () => {
    expect(projectHarvestWindow(placement("crop-1", "plant-lettuce", "2026-03-01"))).toMatchObject({ earliestHarvestOn: "2026-03-31", latestHarvestOn: "2026-04-30", estimated: true });
  });

  it("handles year boundaries and sorts earliest harvest first", () => {
    expect(projectHarvestWindow(placement("crop-1", "plant-basil", "2026-12-15")).earliestHarvestOn).toBe("2027-01-14");
    const schedule = buildHarvestSchedule([placement("late", "plant-garlic", "2026-10-01"), placement("early", "plant-lettuce", "2026-03-01")]);
    expect(schedule.map((item) => item.placementId)).toEqual(["early", "late"]);
  });

  it("rejects unknown plants", () => {
    expect(() => projectHarvestWindow(placement("crop-1", "unknown", "2026-03-01"))).toThrow("unknown plant");
  });
});
