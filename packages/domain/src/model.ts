import type { LengthUnit } from "./measurements.js";

export const growingAreaTypes = [
  "raised_bed",
  "in_ground",
  "container",
  "greenhouse_zone",
  "indoor_box"
] as const;

export type GrowingAreaType = (typeof growingAreaTypes)[number];

export interface GardenSetupInput {
  workspaceName: string;
  propertyName: string;
  gardenName: string;
  growingAreaName: string;
  growingAreaType: GrowingAreaType;
  displayUnit: LengthUnit;
  lengthMillimeters: number;
  widthMillimeters: number;
  depthMillimeters: number;
}

export interface GardenSetupSnapshot extends GardenSetupInput {
  workspaceId: string;
  propertyId: string;
  gardenId: string;
  growingAreaId: string;
  createdAt: string;
  updatedAt: string;
}

function requiredName(value: string, label: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) throw new Error(`${label} is required.`);
  if (normalized.length > 120) throw new Error(`${label} cannot exceed 120 characters.`);
  return normalized;
}

export function validateGardenSetup(input: GardenSetupInput): GardenSetupInput {
  for (const value of [
    input.lengthMillimeters,
    input.widthMillimeters,
    input.depthMillimeters
  ]) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("All dimensions must be positive whole millimeters.");
    }
  }

  return {
    ...input,
    workspaceName: requiredName(input.workspaceName, "Workspace name"),
    propertyName: requiredName(input.propertyName, "Property name"),
    gardenName: requiredName(input.gardenName, "Garden name"),
    growingAreaName: requiredName(input.growingAreaName, "Growing area name")
  };
}
