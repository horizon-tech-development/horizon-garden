import { describe, expect, it } from "vitest";
import { createUuidV7 } from "./uuid-v7.js";

describe("UUIDv7", () => {
  it("creates a standards-shaped time-ordered identifier", () => {
    const first = createUuidV7(1_700_000_000_000);
    const later = createUuidV7(1_700_000_000_001);
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(first < later).toBe(true);
  });
});
