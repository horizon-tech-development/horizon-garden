import { describe, expect, it } from "vitest";
import { validateGardenObservation } from "./observations.js";

const input = { placementId: "placement-1", observedOn: "2026-09-17", kind: "growth" as const, condition: "normal" as const, notes: "  New blossoms.  " };

describe("garden observations", () => {
  it("normalizes a valid observation", () => expect(validateGardenObservation(input).notes).toBe("New blossoms."));
  it("requires meaningful notes", () => expect(() => validateGardenObservation({ ...input, notes: "  " })).toThrow(/required/));
  it("rejects invalid dates, kinds, conditions, and oversized notes", () => {
    expect(() => validateGardenObservation({ ...input, observedOn: "today" })).toThrow(/date/);
    expect(() => validateGardenObservation({ ...input, kind: "diagnosis" as never })).toThrow(/kind/);
    expect(() => validateGardenObservation({ ...input, condition: "resolved" as never })).toThrow(/Condition/);
    expect(() => validateGardenObservation({ ...input, notes: "x".repeat(2001) })).toThrow(/2,000/);
  });
});
