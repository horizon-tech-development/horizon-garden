import { describe, expect, it } from "vitest";
import { filterPlantCatalog, starterPlantCatalog, validateCropPlacement } from "./catalog.js";

describe("plant catalog", () => {
  it("filters by search, season, and environment", () => {
    expect(filterPlantCatalog(starterPlantCatalog, { query: "allium" }).map((plant) => plant.commonName)).toEqual(["Garlic", "Chives"]);
    expect(filterPlantCatalog(starterPlantCatalog, { season: "warm", environment: "indoor" }).map((plant) => plant.commonName)).toEqual(["Tomato", "Pepper", "Basil"]);
  });

  it("validates crop placement boundaries", () => {
    expect(validateCropPlacement({ growingAreaId: "area-1", plantId: "plant-carrot", quantity: 16, plantedOn: "2026-09-13", notes: "  north row  " }).notes).toBe("north row");
    expect(() => validateCropPlacement({ growingAreaId: "area-1", plantId: "unknown", quantity: 1, plantedOn: "2026-09-13", notes: "" })).toThrow("known plant");
    expect(() => validateCropPlacement({ growingAreaId: "area-1", plantId: "plant-carrot", quantity: 0, plantedOn: "2026-09-13", notes: "" })).toThrow("Quantity");
  });
});
