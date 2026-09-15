import type { CareTask, CareTaskKind } from "./care.js";

export const careResultStatuses = ["completed", "skipped"] as const;
export type CareResultStatus = (typeof careResultStatuses)[number];

export interface CareResultInput {
  taskId: string;
  placementId: string;
  kind: CareTaskKind;
  dueOn: string;
  status: CareResultStatus;
  notes: string;
}

export interface CareResult extends CareResultInput {
  id: string;
  recordedAt: string;
}

function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

export function validateCareResult(input: CareResultInput): CareResultInput {
  if (!input.taskId.trim() || !input.placementId.trim()) throw new Error("A care task and placement are required.");
  if (!["moisture-check", "health-check"].includes(input.kind)) throw new Error("Care task kind is invalid.");
  if (!isDateOnly(input.dueOn)) throw new Error("Care task date is invalid.");
  if (!careResultStatuses.includes(input.status)) throw new Error("Care result status is invalid.");
  const notes = input.notes.trim();
  if (notes.length > 1000) throw new Error("Care notes cannot exceed 1,000 characters.");
  return { ...input, taskId: input.taskId.trim(), placementId: input.placementId.trim(), notes };
}

export function unresolvedCareTasks(tasks: CareTask[], results: CareResult[]): CareTask[] {
  const resolvedTaskIds = new Set(results.map((result) => result.taskId));
  return tasks.filter((task) => !resolvedTaskIds.has(task.id));
}
