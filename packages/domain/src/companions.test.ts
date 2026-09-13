import { describe, expect, it } from "vitest";
import { recommendCompanions } from "./companions.js";

describe("companion recommendations", () => {
  it("returns directional recommendations with evidence labels", () => {
    const results = recommendCompanions("plant-tomato");
    expect(results.map((result) => result.companion.commonName)).toEqual(["Basil", "Marigold", "Lettuce"]);
    expect(results.every((result) => result.evidence.length > 0 && result.rationale.length > 0)).toBe(true);
  });

  it("does not invent rules for an unknown crop", () => {
    expect(() => recommendCompanions("plant-unknown")).toThrow("known crop");
  });
});
