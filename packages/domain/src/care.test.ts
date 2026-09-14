import { describe, expect, it } from "vitest";
import { buildCareSchedule } from "./care.js";
import type { CropPlacement } from "./catalog.js";

const lettuce: CropPlacement = { id: "placement-1", growingAreaId: "area-1", plantId: "plant-lettuce", quantity: 4, plantedOn: "2026-09-10", notes: "", createdAt: "2026-09-10T12:00:00Z" };

describe("buildCareSchedule", () => {
  it("projects recurring care tasks within an inclusive date window", () => {
    const tasks = buildCareSchedule([lettuce], "2026-09-12", 3);
    expect(tasks.filter((task) => task.kind === "moisture-check").map((task) => task.dueOn)).toEqual(["2026-09-12", "2026-09-13", "2026-09-14"]);
  });

  it("anchors weekly inspections to the planting date", () => {
    const tasks = buildCareSchedule([lettuce], "2026-09-17", 1);
    expect(tasks.map((task) => task.kind)).toEqual(["moisture-check", "health-check"]);
  });

  it("sorts tasks deterministically", () => {
    const tomato = { ...lettuce, id: "placement-2", plantId: "plant-tomato" };
    const tasks = buildCareSchedule([tomato, lettuce], "2026-09-12", 1);
    expect(tasks.map((task) => task.title)).toEqual(["Check Lettuce moisture", "Check Tomato moisture"]);
  });

  it("rejects invalid ranges and unknown plants", () => {
    expect(() => buildCareSchedule([lettuce], "2026-09-12", 0)).toThrow(/between 1 and 31/);
    expect(() => buildCareSchedule([{ ...lettuce, plantId: "missing" }], "2026-09-12")).toThrow(/unknown plant/);
  });
});
