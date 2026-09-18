import { describe, expect, it } from "vitest";
import { activePlacementsOn, placementEndEvent, placementIsActiveOn, validatePlacementLifecycleEvent, type PlacementLifecycleEvent } from "./placement-lifecycle.js";
import type { CropPlacement } from "./catalog.js";

const placement: CropPlacement = { id: "p1", growingAreaId: "a1", plantId: "plant-tomato", quantity: 1, plantedOn: "2026-05-01", notes: "", createdAt: "2026-05-01T00:00:00Z" };
const ended: PlacementLifecycleEvent = { id: "e1", placementId: "p1", endedOn: "2026-09-01", reason: "harvest-complete", notes: "", recordedAt: "2026-09-01T12:00:00Z" };

describe("crop placement lifecycle", () => {
  it("keeps a placement active through its end date and suppresses it afterward", () => {
    expect(activePlacementsOn([placement], [ended], "2026-09-01")).toHaveLength(1);
    expect(activePlacementsOn([placement], [ended], "2026-09-02")).toHaveLength(0);
    expect(placementIsActiveOn("p1", [ended], "2026-09-02")).toBe(false);
  });
  it("preserves the first immutable end event", () => {
    const later = { ...ended, id: "e2", endedOn: "2026-09-05", recordedAt: "2026-09-05T12:00:00Z" };
    expect(placementEndEvent("p1", [later, ended])?.id).toBe("e1");
  });
  it("validates and trims an end event", () => {
    expect(validatePlacementLifecycleEvent({ placementId: " p1 ", endedOn: "2026-09-01", reason: "removed", notes: " done " })).toEqual({ placementId: "p1", endedOn: "2026-09-01", reason: "removed", notes: "done" });
  });
});
