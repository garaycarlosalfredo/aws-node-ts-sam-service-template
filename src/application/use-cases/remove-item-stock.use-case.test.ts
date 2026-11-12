import { vi, type MockedObject } from "vitest";

import { NotFoundError, ValidationError } from "@domain/errors";
import { ItemStockDepleted } from "@domain/events";
import { Item } from "@domain/models/item";
import { ItemName } from "@domain/models/item-name";
import { Quantity } from "@domain/models/quantity";

import type { EventPublisherPort } from "../ports/event-publisher.port";
import type { ItemRepositoryPort } from "../ports/item-repository.port";
import { RemoveItemStockUseCase } from "./remove-item-stock.use-case";

describe("RemoveItemStockUseCase", () => {
  const items: MockedObject<ItemRepositoryPort> = {
    findById: vi.fn(),
    save: vi.fn(),
  };
  const events: MockedObject<EventPublisherPort> = { publish: vi.fn() };
  const useCase = new RemoveItemStockUseCase(items, events);
  // Items come back from the repository restored, i.e. without pending events.
  const existingItem = (stock: number): Item =>
    Item.restore(
      "id-1",
      ItemName.create("Widget"),
      Quantity.create(stock),
      "active",
    );

  it("removes stock, stores the item and returns its output", async () => {
    items.findById.mockResolvedValue(existingItem(5));

    await expect(useCase.execute({ id: "id-1", amount: 2 })).resolves.toEqual({
      id: "id-1",
      name: "Widget",
      stock: 3,
      status: "active",
    });
    expect(items.save).toHaveBeenCalledTimes(1);
  });

  it("publishes ItemStockDepleted when the stock reaches zero", async () => {
    items.findById.mockResolvedValue(existingItem(2));

    await useCase.execute({ id: "id-1", amount: 2 });

    expect(events.publish).toHaveBeenCalledWith([
      new ItemStockDepleted("id-1"),
    ]);
  });

  it("publishes no events while stock remains", async () => {
    items.findById.mockResolvedValue(existingItem(5));

    await useCase.execute({ id: "id-1", amount: 1 });

    expect(events.publish).toHaveBeenCalledWith([]);
  });

  it("throws NotFoundError when the item does not exist", async () => {
    items.findById.mockResolvedValue(undefined);

    await expect(useCase.execute({ id: "missing", amount: 1 })).rejects.toThrow(
      NotFoundError,
    );
    expect(items.save).not.toHaveBeenCalled();
  });

  it("propagates the domain rule when there is not enough stock and stores nothing", async () => {
    items.findById.mockResolvedValue(existingItem(1));

    await expect(useCase.execute({ id: "id-1", amount: 2 })).rejects.toThrow(
      ValidationError,
    );
    expect(items.save).not.toHaveBeenCalled();
    expect(events.publish).not.toHaveBeenCalled();
  });
});
