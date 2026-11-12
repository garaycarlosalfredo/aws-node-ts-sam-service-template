import type { CreateItemInput } from "../dto/create-item.dto";
import type { ItemOutput } from "../dto/item.dto";

export interface CreateItemUseCasePort {
  execute(input: CreateItemInput): Promise<ItemOutput>;
}
