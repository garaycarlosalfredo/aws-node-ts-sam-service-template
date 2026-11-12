import type { Item, ItemStatus } from "@domain/models/item";

export interface ItemOutput {
  readonly id: string;
  readonly name: string;
  readonly stock: number;
  readonly status: ItemStatus;
}

export function toItemOutput(item: Item): ItemOutput {
  return {
    id: item.id,
    name: item.name.value,
    stock: item.stock.value,
    status: item.status,
  };
}
