import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { endPlacement, loadPlacementLifecycle, loadPlacements, savePlacement } from "./storage";

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); }
  });
});
afterEach(() => vi.unstubAllGlobals());

const event = { placementId: "missing", endedOn: "2026-05-01", reason: "removed" as const, notes: "" };

it("rejects missing placements and invalid dates without storing an end event", async () => {
  await expect(endPlacement(event)).rejects.toThrow(/does not exist/);
  await expect(endPlacement({ ...event, endedOn: "2026-02-30" })).rejects.toThrow(/date/);
  expect(await loadPlacementLifecycle()).toEqual([]);
});

it("enforces planting chronology, retains history, and returns the original end event", async () => {
  const placement = await savePlacement({ growingAreaId: "a1", plantId: "plant-lettuce", quantity: 1, plantedOn: "2026-05-01", notes: "" });
  const input = { ...event, placementId: placement.id };
  await expect(endPlacement({ ...input, endedOn: "2026-04-30" })).rejects.toThrow(/before the planting/);
  expect(await loadPlacementLifecycle()).toEqual([]);
  const ended = await endPlacement({ ...input, placementId: ` ${placement.id} `, notes: " done " });
  expect(ended.notes).toBe("done");
  expect(await endPlacement({ ...input, endedOn: "2026-06-01" })).toEqual(ended);
  expect(await loadPlacementLifecycle()).toEqual([ended]);
  expect(await loadPlacements()).toEqual([placement]);
});
