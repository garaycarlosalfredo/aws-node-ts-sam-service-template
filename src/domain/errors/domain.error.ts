export abstract class DomainError extends Error {
  protected constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}
