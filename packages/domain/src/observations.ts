import { isDateOnly } from "./dates.js";
export const observationKinds = ["general", "growth", "pest", "disease", "damage", "weather"] as const;
export type ObservationKind = (typeof observationKinds)[number];

export const conditionLevels = ["normal", "watch", "action-needed"] as const;
export type ConditionLevel = (typeof conditionLevels)[number];

export interface GardenObservationInput {
  placementId: string;
  observedOn: string;
  kind: ObservationKind;
  condition: ConditionLevel;
  notes: string;
}

export interface GardenObservation extends GardenObservationInput { id: string; recordedAt: string; }

export function validateGardenObservation(input: GardenObservationInput): GardenObservationInput {
  const placementId = input.placementId.trim();
  const notes = input.notes.trim();
  if (!placementId) throw new Error("A crop placement is required.");
  if (!isDateOnly(input.observedOn)) throw new Error("Observation date is invalid.");
  if (!observationKinds.includes(input.kind)) throw new Error("Observation kind is invalid.");
  if (!conditionLevels.includes(input.condition)) throw new Error("Condition level is invalid.");
  if (!notes) throw new Error("Observation notes are required.");
  if (notes.length > 2_000) throw new Error("Observation notes cannot exceed 2,000 characters.");
  return { ...input, placementId, notes };
}

