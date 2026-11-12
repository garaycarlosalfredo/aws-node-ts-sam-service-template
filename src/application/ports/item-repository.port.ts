import type { Item } from "@domain/models/item";

/** Output port: how the application stores and retrieves items. */
export interface ItemRepositoryPort {
  findById(id: string): Promise<Item | undefined>;
  save(item: Item): Promise<void>;
}
