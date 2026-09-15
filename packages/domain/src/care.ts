import { starterPlantCatalog, type CropPlacement } from "./catalog.js";

export type CareTaskKind = "moisture-check" | "health-check";

export interface CareTask {
  id: string;
  placementId: string;
  plantId: string;
  plantName: string;
  kind: CareTaskKind;
  title: string;
  dueOn: string;
  guidance: string;
  estimated: true;
}

export interface CareProfile {
  plantId: string;
  moistureCheckIntervalDays: number;
  moistureGuidance: string;
}

export const starterCareProfiles: CareProfile[] = [
  { plantId: "plant-tomato", moistureCheckIntervalDays: 2, moistureGuidance: "Check soil moisture; water deeply when the upper soil begins to dry." },
  { plantId: "plant-pepper", moistureCheckIntervalDays: 2, moistureGuidance: "Check soil moisture and keep it even without leaving roots waterlogged." },
  { plantId: "plant-lettuce", moistureCheckIntervalDays: 1, moistureGuidance: "Check near-surface moisture; shallow lettuce roots can dry quickly." },
  { plantId: "plant-carrot", moistureCheckIntervalDays: 2, moistureGuidance: "Check moisture and avoid large wet-to-dry swings while roots develop." },
  { plantId: "plant-basil", moistureCheckIntervalDays: 2, moistureGuidance: "Check soil moisture and water at soil level when needed." },
  { plantId: "plant-garlic", moistureCheckIntervalDays: 3, moistureGuidance: "Check soil moisture; allow drainage and avoid persistently soggy soil." },
  { plantId: "plant-marigold", moistureCheckIntervalDays: 3, moistureGuidance: "Check soil moisture and water after the upper soil has begun to dry." },
  { plantId: "plant-chives", moistureCheckIntervalDays: 3, moistureGuidance: "Check soil moisture and water when the upper soil begins to dry." }
];

const dayMilliseconds = 86_400_000;

function parseUtcDate(date: string): Date {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error("Care schedule date is invalid.");
  return parsed;
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function occurrences(placement: CropPlacement, from: Date, through: Date, intervalDays: number): Date[] {
  const planted = parseUtcDate(placement.plantedOn);
  const firstIndex = Math.max(1, Math.ceil((from.getTime() - planted.getTime()) / (intervalDays * dayMilliseconds)));
  const dates: Date[] = [];
  for (let index = firstIndex; ; index += 1) {
    const date = new Date(planted.getTime() + index * intervalDays * dayMilliseconds);
    if (date > through) break;
    if (date >= from) dates.push(date);
  }
  return dates;
}

export function buildCareSchedule(placements: CropPlacement[], fromOn: string, days = 7): CareTask[] {
  if (!Number.isInteger(days) || days < 1 || days > 31) throw new Error("Care schedule range must be between 1 and 31 days.");
  const from = parseUtcDate(fromOn);
  const through = new Date(from.getTime() + (days - 1) * dayMilliseconds);
  const tasks: CareTask[] = [];

  for (const placement of placements) {
    const plant = starterPlantCatalog.find((entry) => entry.id === placement.plantId);
    const profile = starterCareProfiles.find((entry) => entry.plantId === placement.plantId);
    if (!plant || !profile) throw new Error("Cannot schedule care for an unknown plant.");

    for (const due of occurrences(placement, from, through, profile.moistureCheckIntervalDays)) {
      const dueOn = formatUtcDate(due);
      tasks.push({ id: `${placement.id}:moisture:${dueOn}`, placementId: placement.id, plantId: plant.id, plantName: plant.commonName, kind: "moisture-check", title: `Check ${plant.commonName} moisture`, dueOn, guidance: profile.moistureGuidance, estimated: true });
    }
    for (const due of occurrences(placement, from, through, 7)) {
      const dueOn = formatUtcDate(due);
      tasks.push({ id: `${placement.id}:health:${dueOn}`, placementId: placement.id, plantId: plant.id, plantName: plant.commonName, kind: "health-check", title: `Inspect ${plant.commonName} health`, dueOn, guidance: "Inspect leaves, stems, and nearby soil for stress, damage, pests, or disease symptoms.", estimated: true });
    }
  }

  return tasks.sort((left, right) => left.dueOn.localeCompare(right.dueOn) || left.title.localeCompare(right.title));
}
