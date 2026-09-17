export const harvestUnits = ["count", "g", "kg", "oz", "lb"] as const;
export type HarvestUnit = (typeof harvestUnits)[number];

export interface HarvestRecordInput {
  placementId: string;
  harvestedOn: string;
  amount: number;
  unit: HarvestUnit;
  notes: string;
}

export interface HarvestRecord extends HarvestRecordInput {
  id: string;
  recordedAt: string;
}

function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

export function validateHarvestRecord(input: HarvestRecordInput): HarvestRecordInput {
  const placementId = input.placementId.trim();
  if (!placementId) throw new Error("A crop placement is required.");
  if (!isDateOnly(input.harvestedOn)) throw new Error("Harvest date is invalid.");
  if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount > 1_000_000) throw new Error("Harvest amount must be greater than zero and no more than 1,000,000.");
  if (input.unit === "count" && !Number.isInteger(input.amount)) throw new Error("Count harvests must use a whole number.");
  if (!harvestUnits.includes(input.unit)) throw new Error("Harvest unit is invalid.");
  const notes = input.notes.trim();
  if (notes.length > 1_000) throw new Error("Harvest notes cannot exceed 1,000 characters.");
  return { ...input, placementId, notes };
}

export function harvestsForPlacement(records: HarvestRecord[], placementId: string): HarvestRecord[] {
  return records.filter((record) => record.placementId === placementId).sort((left, right) => right.harvestedOn.localeCompare(left.harvestedOn));
}
