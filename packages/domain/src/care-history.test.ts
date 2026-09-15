import { describe, expect, it } from "vitest";
import type { CareTask } from "./care.js";
import { unresolvedCareTasks, validateCareResult, type CareResult } from "./care-history.js";

const task: CareTask = {
  id: "placement-1:moisture:2026-09-16",
  placementId: "placement-1",
  plantId: "plant-lettuce",
  plantName: "Lettuce",
  kind: "moisture-check",
  title: "Check Lettuce moisture",
  dueOn: "2026-09-16",
  guidance: "Check current conditions.",
  estimated: true
};

const result: CareResult = {
  id: "result-1",
  taskId: task.id,
  placementId: task.placementId,
  kind: task.kind,
  dueOn: task.dueOn,
  status: "completed",
  notes: "Soil was still moist; no water added.",
  recordedAt: "2026-09-16T12:00:00Z"
};

describe("care history", () => {
  it("normalizes notes without implying an action", () => {
    expect(validateCareResult({ ...result, notes: "  Soil checked only.  " }).notes).toBe("Soil checked only.");
  });

  it("hides only the exact resolved occurrence", () => {
    const next = { ...task, id: "placement-1:moisture:2026-09-17", dueOn: "2026-09-17" };
    expect(unresolvedCareTasks([task, next], [result])).toEqual([next]);
  });

  it("supports an explicit skipped result", () => {
    expect(validateCareResult({ ...result, status: "skipped" }).status).toBe("skipped");
  });

  it("rejects invalid dates, statuses, and oversized notes", () => {
    expect(() => validateCareResult({ ...result, dueOn: "today" })).toThrow(/date/);
    expect(() => validateCareResult({ ...result, status: "later" as never })).toThrow(/status/);
    expect(() => validateCareResult({ ...result, notes: "x".repeat(1001) })).toThrow(/1,000/);
  });
});
