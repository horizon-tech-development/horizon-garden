import { describe, expect, it } from "vitest";
import { calculateRectangle, fromMillimeters, toMillimeters } from "./measurements.js";

describe("measurements", () => {
  it("normalizes supported units to millimeters", () => {
    expect(toMillimeters({ value: 12, unit: "in" })).toBe(305);
    expect(toMillimeters({ value: 4, unit: "ft" })).toBe(1219);
    expect(toMillimeters({ value: 30, unit: "cm" })).toBe(300);
    expect(toMillimeters({ value: 1.5, unit: "m" })).toBe(1500);
  });

  it("converts normalized measurements for display", () => {
    expect(fromMillimeters(1000, "m")).toBe(1);
    expect(fromMillimeters(305, "in")).toBeCloseTo(12.0079, 4);
  });

  it("calculates area and soil volume", () => {
    expect(
      calculateRectangle({
        lengthMillimeters: 2438,
        widthMillimeters: 1219,
        depthMillimeters: 305
      })
    ).toEqual({
      areaSquareMeters: 2.971922,
      soilVolumeLiters: 906.43621
    });
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid dimensions: %s",
    (value) => {
      expect(() => toMillimeters({ value, unit: "ft" })).toThrow();
    }
  );
});
