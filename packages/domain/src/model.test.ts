import { describe, expect, it } from "vitest";
import { validateGardenSetup } from "./model.js";

describe("garden setup", () => {
  const valid = {
    workspaceName: "Home Garden",
    propertyName: "Home",
    gardenName: "Backyard",
    growingAreaName: "Bed 1",
    growingAreaType: "raised_bed" as const,
    displayUnit: "ft" as const,
    lengthMillimeters: 2438,
    widthMillimeters: 1219,
    depthMillimeters: 305
  };

  it("normalizes names", () => {
    expect(validateGardenSetup({ ...valid, workspaceName: "  Home Garden  " }).workspaceName)
      .toBe("Home Garden");
  });

  it("rejects missing names", () => {
    expect(() => validateGardenSetup({ ...valid, gardenName: " " })).toThrow(
      "Garden name is required."
    );
  });
});
