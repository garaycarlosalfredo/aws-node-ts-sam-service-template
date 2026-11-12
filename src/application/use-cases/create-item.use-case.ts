import { Item } from "@domain/models/item";
import { ItemName } from "@domain/models/item-name";
import { Quantity } from "@domain/models/quantity";

import type { CreateItemInput } from "../dto/create-item.dto";
import { toItemOutput, type ItemOutput } from "../dto/item.dto";
import type { CreateItemUseCasePort } from "../ports/create-item-use-case.port";
import type { EventPublisherPort } from "../ports/event-publisher.port";
import type { IdGeneratorPort } from "../ports/id-generator.port";
import type { ItemRepositoryPort } from "../ports/item-repository.port";

export class CreateItemUseCase implements CreateItemUseCasePort {
  constructor(
    private readonly items: ItemRepositoryPort,
    private readonly idGenerator: IdGeneratorPort,
    private readonly events: EventPublisherPort,
  ) {}

  public async execute(input: CreateItemInput): Promise<ItemOutput> {
    const item = Item.create(
      this.idGenerator.generate(),
      ItemName.create(input.name),
      Quantity.create(input.stock),
    );

    await this.items.save(item);
    await this.events.publish(item.pullEvents());

    return toItemOutput(item);
  }
}
