import type { DomainEvent } from "./domain-event";

export class ItemCreated implements DomainEvent {
  public readonly name = "ItemCreated";

  constructor(
    public readonly itemId: string,
    public readonly initialStock: number,
  ) {}
}
