import type { GetItemInput } from "../dto/get-item.dto";
import type { ItemOutput } from "../dto/item.dto";

export interface GetItemUseCasePort {
  execute(input: GetItemInput): Promise<ItemOutput>;
}
