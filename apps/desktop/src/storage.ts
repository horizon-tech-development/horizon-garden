import { invoke } from "@tauri-apps/api/core";
import type { CareResult, CareResultInput, CropPlacement, CropPlacementInput, GardenObservation, GardenObservationInput, GardenSetupInput, GardenSetupSnapshot, HarvestRecord, HarvestRecordInput, PlacementLifecycleEvent, PlacementLifecycleEventInput } from "@horizon-garden/domain";

const previewStorageKey = "horizon-garden-preview-snapshot";
const previewPlacementsKey = "horizon-garden-preview-placements";
const previewCareResultsKey = "horizon-garden-preview-care-results";
const previewHarvestsKey = "horizon-garden-preview-harvests";
const previewObservationsKey = "horizon-garden-preview-observations";
const previewLifecycleKey = "horizon-garden-preview-placement-lifecycle";

function isTauri(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

export async function loadSetup(): Promise<GardenSetupSnapshot | null> {
  if (isTauri()) return invoke<GardenSetupSnapshot | null>("load_setup");
  const stored = localStorage.getItem(previewStorageKey);
  return stored ? (JSON.parse(stored) as GardenSetupSnapshot) : null;
}

export async function saveSetup(input: GardenSetupInput): Promise<GardenSetupSnapshot> {
  if (isTauri()) return invoke<GardenSetupSnapshot>("save_setup", { input });

  const existing = await loadSetup();
  const timestamp = new Date().toISOString();
  const snapshot: GardenSetupSnapshot = {
    ...input,
    workspaceId: existing?.workspaceId ?? crypto.randomUUID(),
    propertyId: existing?.propertyId ?? crypto.randomUUID(),
    gardenId: existing?.gardenId ?? crypto.randomUUID(),
    growingAreaId: existing?.growingAreaId ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp
  };
  localStorage.setItem(previewStorageKey, JSON.stringify(snapshot));
  return snapshot;
}

export async function loadPlacements(): Promise<CropPlacement[]> {
  if (isTauri()) return invoke<CropPlacement[]>("load_placements");
  const stored = localStorage.getItem(previewPlacementsKey);
  return stored ? (JSON.parse(stored) as CropPlacement[]) : [];
}

export async function savePlacement(input: CropPlacementInput): Promise<CropPlacement> {
  if (isTauri()) return invoke<CropPlacement>("save_placement", { input });
  const placements = await loadPlacements();
  const placement: CropPlacement = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(previewPlacementsKey, JSON.stringify([...placements, placement]));
  return placement;
}

export async function loadCareResults(): Promise<CareResult[]> {
  if (isTauri()) return invoke<CareResult[]>("load_care_results");
  const stored = localStorage.getItem(previewCareResultsKey);
  return stored ? (JSON.parse(stored) as CareResult[]) : [];
}

export async function saveCareResult(input: CareResultInput): Promise<CareResult> {
  if (isTauri()) return invoke<CareResult>("save_care_result", { input });
  const results = await loadCareResults();
  const existing = results.find((result) => result.taskId === input.taskId);
  if (existing) return existing;
  const result: CareResult = { ...input, id: crypto.randomUUID(), recordedAt: new Date().toISOString() };
  localStorage.setItem(previewCareResultsKey, JSON.stringify([...results, result]));
  return result;
}

export async function loadHarvests(): Promise<HarvestRecord[]> {
  if (isTauri()) return invoke<HarvestRecord[]>("load_harvests");
  const stored = localStorage.getItem(previewHarvestsKey);
  return stored ? (JSON.parse(stored) as HarvestRecord[]) : [];
}

export async function saveHarvest(input: HarvestRecordInput): Promise<HarvestRecord> {
  if (isTauri()) return invoke<HarvestRecord>("save_harvest", { input });
  const records = await loadHarvests();
  const record: HarvestRecord = { ...input, id: crypto.randomUUID(), recordedAt: new Date().toISOString() };
  localStorage.setItem(previewHarvestsKey, JSON.stringify([...records, record]));
  return record;
}

export async function loadObservations(): Promise<GardenObservation[]> {
  if (isTauri()) return invoke<GardenObservation[]>("load_observations");
  const stored = localStorage.getItem(previewObservationsKey);
  return stored ? (JSON.parse(stored) as GardenObservation[]) : [];
}

export async function saveObservation(input: GardenObservationInput): Promise<GardenObservation> {
  if (isTauri()) return invoke<GardenObservation>("save_observation", { input });
  const observations = await loadObservations();
  const observation: GardenObservation = { ...input, id: crypto.randomUUID(), recordedAt: new Date().toISOString() };
  localStorage.setItem(previewObservationsKey, JSON.stringify([...observations, observation]));
  return observation;
}

export async function loadPlacementLifecycle(): Promise<PlacementLifecycleEvent[]> {
  if (isTauri()) return invoke<PlacementLifecycleEvent[]>("load_placement_lifecycle");
  const stored = localStorage.getItem(previewLifecycleKey);
  return stored ? (JSON.parse(stored) as PlacementLifecycleEvent[]) : [];
}

export async function endPlacement(input: PlacementLifecycleEventInput): Promise<PlacementLifecycleEvent> {
  if (isTauri()) return invoke<PlacementLifecycleEvent>("end_placement", { input });
  const events = await loadPlacementLifecycle();
  const existing = events.find((event) => event.placementId === input.placementId);
  if (existing) return existing;
  const event: PlacementLifecycleEvent = { ...input, id: crypto.randomUUID(), recordedAt: new Date().toISOString() };
  localStorage.setItem(previewLifecycleKey, JSON.stringify([...events, event]));
  return event;
}

export async function exportBackup(): Promise<string> {
  if (isTauri()) return invoke<string>("export_backup");
  const payload = {
    format: "horizon-garden-backup",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    setup: await loadSetup(),
    placements: await loadPlacements(),
    careResults: await loadCareResults(),
    harvests: await loadHarvests(),
    observations: await loadObservations(),
    placementLifecycle: await loadPlacementLifecycle()
  };
  const filename = `horizon-garden-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  return filename;
}
