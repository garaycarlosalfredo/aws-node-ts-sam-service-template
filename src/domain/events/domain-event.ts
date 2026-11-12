/**
 * Something that happened in the domain and that other parts of the system may care about.
 * Events carry only facts (past tense); they do not know who listens to them.
 */
export interface DomainEvent {
  readonly name: string;
}
