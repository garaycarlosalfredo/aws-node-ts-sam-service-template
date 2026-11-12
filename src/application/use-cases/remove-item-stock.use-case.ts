import { NotFoundError } from "@domain/errors";
import { Quantity } from "@domain/models/quantity";

import { toItemOutput, type ItemOutput } from "../dto/item.dto";
import type { RemoveItemStockInput } from "../dto/remove-item-stock.dto";
import type { EventPublisherPort } from "../ports/event-publisher.port";
import type { ItemRepositoryPort } from "../ports/item-repository.port";
import type { RemoveItemStockUseCasePort } from "../ports/remove-item-stock-use-case.port";

export class RemoveItemStockUseCase implements RemoveItemStockUseCasePort {
  constructor(
    private readonly items: ItemRepositoryPort,
    private readonly events: EventPublisherPort,
  ) {}

  public async execute(input: RemoveItemStockInput): Promise<ItemOutput> {
    const item = await this.items.findById(input.id);

    if (!item) {
      throw new NotFoundError("Item", input.id);
    }

    // The business rules (enough stock, item not archived) are enforced by the domain.
    item.removeStock(Quantity.create(input.amount));
    await this.items.save(item);
    await this.events.publish(item.pullEvents());

    return toItemOutput(item);
  }
}
