/** Output port: keeps id generation out of the domain so it stays deterministic and testable. */
export interface IdGeneratorPort {
  generate(): string;
}
