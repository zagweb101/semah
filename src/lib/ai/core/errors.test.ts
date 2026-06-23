import { describe, it, expect } from "vitest";
import { safeErrorMessage, AIValidationError, AITimeoutError, AIRateLimitError, AIContentFilterError, AIAuthenticationError } from "./errors";

describe("safeErrorMessage", () => {
  it("returns friendly Arabic messages for known error types", () => {
    expect(safeErrorMessage(new AIValidationError("bad", []))).toContain("التحقق");
    expect(safeErrorMessage(new AITimeoutError(5000))).toContain("مهلة");
    expect(safeErrorMessage(new AIRateLimitError())).toContain("حد");
    expect(safeErrorMessage(new AIContentFilterError())).toContain("رفض");
    expect(safeErrorMessage(new AIAuthenticationError())).toContain("الإعدادات");
  });

  it("returns a generic message for unknown errors", () => {
    expect(safeErrorMessage(new Error("random"))).toContain("غير متوقع");
    expect(safeErrorMessage("string error")).toContain("غير متوقع");
  });
});
