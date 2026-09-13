export const lengthUnits = ["in", "ft", "cm", "m"] as const;
export type LengthUnit = (typeof lengthUnits)[number];

export interface DimensionInput {
  value: number;
  unit: LengthUnit;
}

const millimetersPerUnit: Record<LengthUnit, number> = {
  in: 25.4,
  ft: 304.8,
  cm: 10,
  m: 1000
};

const maximumDimensionMillimeters = 1_000_000;

export function toMillimeters(input: DimensionInput): number {
  if (!Number.isFinite(input.value) || input.value <= 0) {
    throw new RangeError("Dimension must be a positive number.");
  }

  const millimeters = Math.round(input.value * millimetersPerUnit[input.unit]);
  if (millimeters < 1) {
    throw new RangeError("Dimension must be at least 1 millimeter.");
  }
  if (millimeters > maximumDimensionMillimeters) {
    throw new RangeError("Dimension cannot exceed 1,000 meters.");
  }
  return millimeters;
}

export function fromMillimeters(millimeters: number, unit: LengthUnit): number {
  if (!Number.isInteger(millimeters) || millimeters <= 0) {
    throw new RangeError("Stored dimension must be a positive whole millimeter.");
  }
  return millimeters / millimetersPerUnit[unit];
}

export interface RectangleMeasurements {
  lengthMillimeters: number;
  widthMillimeters: number;
  depthMillimeters: number;
}

export interface RectangleCalculations {
  areaSquareMeters: number;
  soilVolumeLiters: number;
}

export function calculateRectangle(
  measurements: RectangleMeasurements
): RectangleCalculations {
  const { lengthMillimeters, widthMillimeters, depthMillimeters } = measurements;
  for (const value of [lengthMillimeters, widthMillimeters, depthMillimeters]) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new RangeError("Rectangle measurements must be positive whole millimeters.");
    }
  }

  return {
    areaSquareMeters: (lengthMillimeters * widthMillimeters) / 1_000_000,
    soilVolumeLiters:
      (lengthMillimeters * widthMillimeters * depthMillimeters) / 1_000_000
  };
}
