import { InvalidStateError, ValidationError } from "../errors";
import { ItemCreated, ItemStockDepleted, type DomainEvent } from "../events";
import type { ItemName } from "./item-name";
import type { Quantity } from "./quantity";

export type ItemStatus = "active" | "archived";

/**
 * Aggregate root of the example domain. It owns every business rule about stock
 * and lifecycle; use cases only load it, call these methods and save it back.
 *
 * Meaningful facts are recorded as domain events. The use case collects them with
 * `pullEvents()` after saving and hands them to an output port.
 */
export class Item {
  private pendingEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: string,
    public readonly name: ItemName,
    private currentStock: Quantity,
    private currentStatus: ItemStatus,
  ) {}

  public static create(id: string, name: ItemName, stock: Quantity): Item {
    const item = new Item(id, name, stock, "active");
    item.pendingEvents.push(new ItemCreated(id, stock.value));
    return item;
  }

  /** Rebuilds an item from persisted state without applying creation rules. */
  public static restore(
    id: string,
    name: ItemName,
    stock: Quantity,
    status: ItemStatus,
  ): Item {
    return new Item(id, name, stock, status);
  }

  public get stock(): Quantity {
    return this.currentStock;
  }

  public get status(): ItemStatus {
    return this.currentStatus;
  }

  public addStock(amount: Quantity): void {
    this.assertActive();
    this.currentStock = this.currentStock.add(amount);
  }

  public removeStock(amount: Quantity): void {
    this.assertActive();

    if (amount.isGreaterThan(this.currentStock)) {
      throw new ValidationError("Not enough stock");
    }

    this.currentStock = this.currentStock.subtract(amount);

    if (this.currentStock.isZero()) {
      this.pendingEvents.push(new ItemStockDepleted(this.id));
    }
  }

  /** Returns the events recorded since the last call and forgets them. */
  public pullEvents(): readonly DomainEvent[] {
    const events = this.pendingEvents;
    this.pendingEvents = [];
    return events;
  }

  public archive(): void {
    this.assertActive();

    if (!this.currentStock.isZero()) {
      throw new InvalidStateError(
        "Cannot archive an item that still has stock",
      );
    }

    this.currentStatus = "archived";
  }

  private assertActive(): void {
    if (this.currentStatus === "archived") {
      throw new InvalidStateError("Item is archived");
    }
  }
}
