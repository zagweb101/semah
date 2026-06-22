export class AIError extends Error {
  constructor(message: string, public readonly code: string) { super(message); this.name = "AIError"; }
}
export class AIProviderError extends AIError { constructor(message: string, code = "PROVIDER_ERROR") { super(message, code); this.name = "AIProviderError"; } }
export class AITimeoutError extends AIError { constructor(timeoutMs: number) { super(`Operation timed out after ${timeoutMs}ms`, "TIMEOUT"); this.name = "AITimeoutError"; } }
export class AIRateLimitError extends AIError { constructor() { super("Provider rate limit exceeded", "RATE_LIMIT"); this.name = "AIRateLimitError"; } }
export class AIValidationError extends AIError {
  constructor(message: string, public readonly issues: unknown) { super(message, "VALIDATION_ERROR"); this.name = "AIValidationError"; }
}
export class AIContentFilterError extends AIError { constructor() { super("Content was rejected by provider's safety filter", "CONTENT_FILTER"); this.name = "AIContentFilterError"; } }
export class AIAuthenticationError extends AIError { constructor() { super("Provider authentication failed — check API key", "AUTH_ERROR"); this.name = "AIAuthenticationError"; } }

export function safeErrorMessage(error: unknown): string {
  if (error instanceof AIValidationError) return "فشل التحقق من بنية الإخراج — يرجى المحاولة مرة أخرى";
  if (error instanceof AITimeoutError) return "انتهت مهلة العملية — يرجى المحاولة مرة أخرى";
  if (error instanceof AIRateLimitError) return "تم تجاوز حد المزود — يرجى المحاولة لاحقًا";
  if (error instanceof AIContentFilterError) return "تم رفض المحتوى من قبل فلتر المزود";
  if (error instanceof AIAuthenticationError) return "فشل الاتصال بمزود الذكاء الاصطناعي — راجع الإعدادات";
  return "حدث خطأ غير متوقع أثناء المعالجة";
}
