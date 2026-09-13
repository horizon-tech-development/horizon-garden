import { starterPlantCatalog, type CropPlacement } from "./catalog.js";

export interface HarvestWindow {
  placementId: string;
  plantId: string;
  plantName: string;
  plantedOn: string;
  earliestHarvestOn: string;
  latestHarvestOn: string;
  estimated: true;
}

function addUtcDays(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error("Planting date is invalid.");
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function projectHarvestWindow(placement: CropPlacement): HarvestWindow {
  const plant = starterPlantCatalog.find((entry) => entry.id === placement.plantId);
  if (!plant) throw new Error("Cannot schedule an unknown plant.");
  return {
    placementId: placement.id,
    plantId: placement.plantId,
    plantName: plant.commonName,
    plantedOn: placement.plantedOn,
    earliestHarvestOn: addUtcDays(placement.plantedOn, plant.daysToHarvestMin),
    latestHarvestOn: addUtcDays(placement.plantedOn, plant.daysToHarvestMax),
    estimated: true
  };
}

export function buildHarvestSchedule(placements: CropPlacement[]): HarvestWindow[] {
  return placements.map(projectHarvestWindow).sort((left, right) => left.earliestHarvestOn.localeCompare(right.earliestHarvestOn));
}
