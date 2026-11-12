import { DomainError } from "./domain.error";

export class InvalidStateError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStateError";
  }
}
