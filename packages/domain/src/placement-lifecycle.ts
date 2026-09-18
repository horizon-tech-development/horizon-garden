import type { CropPlacement } from "./catalog.js";

export const placementEndReasons = ["harvest-complete", "crop-failed", "removed", "season-ended"] as const;
export type PlacementEndReason = (typeof placementEndReasons)[number];

export interface PlacementLifecycleEventInput {
  placementId: string;
  endedOn: string;
  reason: PlacementEndReason;
  notes: string;
}

export interface PlacementLifecycleEvent extends PlacementLifecycleEventInput {
  id: string;
  recordedAt: string;
}

export function validatePlacementLifecycleEvent(input: PlacementLifecycleEventInput): PlacementLifecycleEventInput {
  if (!input.placementId.trim()) throw new Error("A crop placement is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.endedOn)) throw new Error("End date is required.");
  if (!placementEndReasons.includes(input.reason)) throw new Error("Select a valid end reason.");
  if (input.notes.length > 1_000) throw new Error("Lifecycle notes cannot exceed 1,000 characters.");
  return { ...input, placementId: input.placementId.trim(), notes: input.notes.trim() };
}

export function placementEndEvent(placementId: string, events: PlacementLifecycleEvent[]): PlacementLifecycleEvent | undefined {
  return events
    .filter((event) => event.placementId === placementId)
    .sort((left, right) => left.endedOn.localeCompare(right.endedOn) || left.recordedAt.localeCompare(right.recordedAt))[0];
}

export function activePlacementsOn(placements: CropPlacement[], events: PlacementLifecycleEvent[], on: string): CropPlacement[] {
  return placements.filter((placement) => {
    const ended = placementEndEvent(placement.id, events);
    return !ended || ended.endedOn >= on;
  });
}

export function placementIsActiveOn(placementId: string, events: PlacementLifecycleEvent[], on: string): boolean {
  const ended = placementEndEvent(placementId, events);
  return !ended || ended.endedOn >= on;
}
