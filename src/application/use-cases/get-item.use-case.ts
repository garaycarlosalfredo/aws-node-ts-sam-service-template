import { NotFoundError } from "@domain/errors";

import type { GetItemInput } from "../dto/get-item.dto";
import { toItemOutput, type ItemOutput } from "../dto/item.dto";
import type { GetItemUseCasePort } from "../ports/get-item-use-case.port";
import type { ItemRepositoryPort } from "../ports/item-repository.port";

export class GetItemUseCase implements GetItemUseCasePort {
  constructor(private readonly items: ItemRepositoryPort) {}

  public async execute(input: GetItemInput): Promise<ItemOutput> {
    const item = await this.items.findById(input.id);

    if (!item) {
      throw new NotFoundError("Item", input.id);
    }

    return toItemOutput(item);
  }
}
