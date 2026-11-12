import { DomainError } from "./domain.error";

export interface ValidationIssue {
  readonly path: string;
  readonly code: string;
  readonly message: string;
}

export class ValidationError extends DomainError {
  public readonly details: readonly ValidationIssue[];

  constructor(
    message = "Validation failed",
    details: readonly ValidationIssue[] = [],
  ) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}
