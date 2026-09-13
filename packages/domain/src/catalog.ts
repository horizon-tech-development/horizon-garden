export const growingSeasons = ["cool", "warm", "perennial"] as const;
export type GrowingSeason = (typeof growingSeasons)[number];

export const growingEnvironments = ["outdoor", "greenhouse", "indoor"] as const;
export type GrowingEnvironment = (typeof growingEnvironments)[number];

export interface PlantCatalogEntry {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  seasons: GrowingSeason[];
  environments: GrowingEnvironment[];
  spacingMillimeters: number;
  daysToHarvestMin: number;
  daysToHarvestMax: number;
  summary: string;
}

export const starterPlantCatalog: PlantCatalogEntry[] = [
  { id: "plant-tomato", commonName: "Tomato", scientificName: "Solanum lycopersicum", family: "Solanaceae", seasons: ["warm"], environments: ["outdoor", "greenhouse", "indoor"], spacingMillimeters: 610, daysToHarvestMin: 60, daysToHarvestMax: 90, summary: "Warm-season fruiting crop that benefits from support and consistent watering." },
  { id: "plant-pepper", commonName: "Pepper", scientificName: "Capsicum annuum", family: "Solanaceae", seasons: ["warm"], environments: ["outdoor", "greenhouse", "indoor"], spacingMillimeters: 457, daysToHarvestMin: 60, daysToHarvestMax: 100, summary: "Heat-loving crop suited to beds, containers, and protected growing." },
  { id: "plant-lettuce", commonName: "Lettuce", scientificName: "Lactuca sativa", family: "Asteraceae", seasons: ["cool"], environments: ["outdoor", "greenhouse", "indoor"], spacingMillimeters: 203, daysToHarvestMin: 30, daysToHarvestMax: 60, summary: "Fast cool-season leafy crop that tolerates partial shade." },
  { id: "plant-carrot", commonName: "Carrot", scientificName: "Daucus carota subsp. sativus", family: "Apiaceae", seasons: ["cool"], environments: ["outdoor", "greenhouse"], spacingMillimeters: 76, daysToHarvestMin: 55, daysToHarvestMax: 80, summary: "Root crop requiring loose, stone-free soil and even moisture." },
  { id: "plant-basil", commonName: "Basil", scientificName: "Ocimum basilicum", family: "Lamiaceae", seasons: ["warm"], environments: ["outdoor", "greenhouse", "indoor"], spacingMillimeters: 305, daysToHarvestMin: 30, daysToHarvestMax: 60, summary: "Tender annual herb harvested repeatedly through warm weather." },
  { id: "plant-garlic", commonName: "Garlic", scientificName: "Allium sativum", family: "Amaryllidaceae", seasons: ["cool"], environments: ["outdoor", "greenhouse"], spacingMillimeters: 152, daysToHarvestMin: 210, daysToHarvestMax: 270, summary: "Long-season bulb crop commonly planted in fall for summer harvest." },
  { id: "plant-marigold", commonName: "Marigold", scientificName: "Tagetes spp.", family: "Asteraceae", seasons: ["warm"], environments: ["outdoor", "greenhouse"], spacingMillimeters: 229, daysToHarvestMin: 50, daysToHarvestMax: 70, summary: "Flowering annual that attracts beneficial insects and adds garden diversity." },
  { id: "plant-chives", commonName: "Chives", scientificName: "Allium schoenoprasum", family: "Amaryllidaceae", seasons: ["cool", "perennial"], environments: ["outdoor", "greenhouse", "indoor"], spacingMillimeters: 203, daysToHarvestMin: 60, daysToHarvestMax: 90, summary: "Hardy perennial herb with edible leaves and pollinator-friendly flowers." }
];

export interface CatalogFilter {
  query?: string;
  season?: GrowingSeason | "all";
  environment?: GrowingEnvironment | "all";
}

export function filterPlantCatalog(entries: PlantCatalogEntry[], filter: CatalogFilter): PlantCatalogEntry[] {
  const query = filter.query?.trim().toLocaleLowerCase() ?? "";
  return entries.filter((entry) => {
    const matchesQuery = !query || [entry.commonName, entry.scientificName, entry.family].some((value) => value.toLocaleLowerCase().includes(query));
    const matchesSeason = !filter.season || filter.season === "all" || entry.seasons.includes(filter.season);
    const matchesEnvironment = !filter.environment || filter.environment === "all" || entry.environments.includes(filter.environment);
    return matchesQuery && matchesSeason && matchesEnvironment;
  });
}

export interface CropPlacementInput {
  growingAreaId: string;
  plantId: string;
  quantity: number;
  plantedOn: string;
  notes: string;
}

export interface CropPlacement extends CropPlacementInput {
  id: string;
  createdAt: string;
}

export function validateCropPlacement(input: CropPlacementInput): CropPlacementInput {
  if (!input.growingAreaId.trim()) throw new Error("A growing area is required.");
  if (!starterPlantCatalog.some((plant) => plant.id === input.plantId)) throw new Error("Select a known plant.");
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 10_000) throw new Error("Quantity must be a whole number between 1 and 10,000.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.plantedOn)) throw new Error("Planting date is required.");
  if (input.notes.length > 1_000) throw new Error("Notes cannot exceed 1,000 characters.");
  return { ...input, growingAreaId: input.growingAreaId.trim(), notes: input.notes.trim() };
}
