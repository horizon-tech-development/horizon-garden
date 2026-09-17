import { describe, expect, it } from "vitest";
import { harvestsForPlacement, validateHarvestRecord, type HarvestRecord } from "./harvests.js";

const input = { placementId: "placement-1", harvestedOn: "2026-09-17", amount: 2.5, unit: "lb" as const, notes: "  First picking.  " };

describe("harvest records", () => {
  it("normalizes notes and accepts measured harvests", () => expect(validateHarvestRecord(input).notes).toBe("First picking."));
  it("requires whole-number counts", () => expect(() => validateHarvestRecord({ ...input, amount: 1.5, unit: "count" })).toThrow(/whole number/));
  it("rejects invalid dates, amounts, units, and oversized notes", () => {
    expect(() => validateHarvestRecord({ ...input, harvestedOn: "today" })).toThrow(/date/);
    expect(() => validateHarvestRecord({ ...input, amount: 0 })).toThrow(/amount/);
    expect(() => validateHarvestRecord({ ...input, unit: "bushel" as never })).toThrow(/unit/);
    expect(() => validateHarvestRecord({ ...input, notes: "x".repeat(1001) })).toThrow(/1,000/);
  });
  it("filters and sorts a placement's harvest history", () => {
    const records = [
      { ...input, id: "1", recordedAt: "2026-09-17T12:00:00Z" },
      { ...input, id: "2", harvestedOn: "2026-09-19", recordedAt: "2026-09-19T12:00:00Z" },
      { ...input, id: "3", placementId: "placement-2", recordedAt: "2026-09-17T12:00:00Z" }
    ] satisfies HarvestRecord[];
    expect(harvestsForPlacement(records, "placement-1").map((record) => record.id)).toEqual(["2", "1"]);
  });
});
