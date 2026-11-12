import type { ItemOutput } from "../dto/item.dto";
import type { RemoveItemStockInput } from "../dto/remove-item-stock.dto";

export interface RemoveItemStockUseCasePort {
  execute(input: RemoveItemStockInput): Promise<ItemOutput>;
}
