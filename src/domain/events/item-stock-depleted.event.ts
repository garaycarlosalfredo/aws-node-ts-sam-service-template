import type { DomainEvent } from "./domain-event";

export class ItemStockDepleted implements DomainEvent {
  public readonly name = "ItemStockDepleted";

  constructor(public readonly itemId: string) {}
}
