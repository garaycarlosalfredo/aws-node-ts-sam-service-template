import { DomainError } from "./domain.error";

export class NotFoundError extends DomainError {
  constructor(resource: string, identifier?: string) {
    super(
      identifier === undefined
        ? `${resource} not found`
        : `${resource} '${identifier}' not found`,
    );
    this.name = "NotFoundError";
  }
}
