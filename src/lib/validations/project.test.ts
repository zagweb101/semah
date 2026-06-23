import { describe, it, expect } from "vitest";
import { canTransition } from "./project";

describe("canTransition", () => {
  it("allows forward transitions", () => {
    expect(canTransition("DRAFT", "BRIEF_IN_PROGRESS")).toBe(true);
    expect(canTransition("BRIEF_IN_PROGRESS", "READY_FOR_ANALYSIS")).toBe(true);
    expect(canTransition("CLIENT_REVIEW", "APPROVED")).toBe(true);
  });

  it("allows backward/revision transitions", () => {
    expect(canTransition("CLIENT_REVIEW", "REVISION_REQUESTED")).toBe(true);
    expect(canTransition("REVISION_REQUESTED", "INTERNAL_REVIEW")).toBe(true);
  });

  it("disallows invalid transitions", () => {
    expect(canTransition("DRAFT", "APPROVED")).toBe(false);
    expect(canTransition("ARCHIVED", "APPROVED")).toBe(false);
  });

  it("returns false for unknown statuses", () => {
    expect(canTransition("UNKNOWN", "DRAFT")).toBe(false);
    expect(canTransition("DRAFT", "UNKNOWN")).toBe(false);
  });
});
