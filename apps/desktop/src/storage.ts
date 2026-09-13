import { invoke } from "@tauri-apps/api/core";
import type { GardenSetupInput, GardenSetupSnapshot } from "@horizon-garden/domain";

const previewStorageKey = "horizon-garden-preview-snapshot";

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
