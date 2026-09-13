import { starterPlantCatalog, type PlantCatalogEntry } from "./catalog.js";

export const companionBenefitTypes = ["beneficial_insects", "pest_disruption", "microclimate", "space_use", "diversity"] as const;
export type CompanionBenefitType = (typeof companionBenefitTypes)[number];
export type EvidenceLevel = "supported" | "mixed" | "traditional";

export interface CompanionRule {
  cropId: string;
  companionId: string;
  benefit: CompanionBenefitType;
  evidence: EvidenceLevel;
  rationale: string;
  caution?: string;
}

export interface CompanionRecommendation extends CompanionRule {
  companion: PlantCatalogEntry;
}

export const companionRules: CompanionRule[] = [
  { cropId: "plant-tomato", companionId: "plant-basil", benefit: "diversity", evidence: "mixed", rationale: "Adds a harvestable herb beneath or near supported tomatoes.", caution: "Claims that basil reliably repels tomato pests are not well established." },
  { cropId: "plant-tomato", companionId: "plant-marigold", benefit: "beneficial_insects", evidence: "supported", rationale: "Flowers can provide nectar and pollen for beneficial insects.", caution: "This does not guarantee pest prevention." },
  { cropId: "plant-tomato", companionId: "plant-lettuce", benefit: "space_use", evidence: "traditional", rationale: "A low, quick crop may use open soil before tomatoes fill their spacing." },
  { cropId: "plant-pepper", companionId: "plant-basil", benefit: "space_use", evidence: "traditional", rationale: "Compact basil can share warm-season growing conditions when spacing is maintained." },
  { cropId: "plant-pepper", companionId: "plant-marigold", benefit: "beneficial_insects", evidence: "supported", rationale: "Long-blooming flowers can support pollinators and natural enemies of pests." },
  { cropId: "plant-carrot", companionId: "plant-chives", benefit: "diversity", evidence: "traditional", rationale: "Combines upright alliums with a root crop while maintaining distinct harvest zones." },
  { cropId: "plant-lettuce", companionId: "plant-chives", benefit: "diversity", evidence: "traditional", rationale: "A perennial edge herb can add flowers and structural diversity near leafy crops." },
  { cropId: "plant-basil", companionId: "plant-tomato", benefit: "microclimate", evidence: "traditional", rationale: "Tall tomatoes may offer limited afternoon shade during hot weather.", caution: "Avoid deep shade and preserve airflow." },
  { cropId: "plant-garlic", companionId: "plant-lettuce", benefit: "space_use", evidence: "traditional", rationale: "Fast leafy crops may use gaps while garlic is small.", caution: "Do not crowd bulbs or interfere with drying near harvest." },
  { cropId: "plant-marigold", companionId: "plant-tomato", benefit: "diversity", evidence: "supported", rationale: "A fruiting crop adds structure while marigold supplies floral resources." }
];

export function recommendCompanions(cropId: string): CompanionRecommendation[] {
  if (!starterPlantCatalog.some((plant) => plant.id === cropId)) throw new Error("Select a known crop.");
  return companionRules
    .filter((rule) => rule.cropId === cropId)
    .map((rule) => ({ ...rule, companion: starterPlantCatalog.find((plant) => plant.id === rule.companionId)! }));
}
