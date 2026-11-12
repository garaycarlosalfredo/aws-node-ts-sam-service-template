import { NotFoundError } from "@domain/errors";
import { Item } from "@domain/models/item";
import { ItemName } from "@domain/models/item-name";
import { Quantity } from "@domain/models/quantity";

import type { ItemRepositoryPort } from "../ports/item-repository.port";
import { GetItemUseCase } from "./get-item.use-case";

describe("GetItemUseCase", () => {
  const items: jest.Mocked<ItemRepositoryPort> = {
    findById: jest.fn(),
    save: jest.fn(),
  };
  const useCase = new GetItemUseCase(items);

  it("returns the output of an existing item", async () => {
    items.findById.mockResolvedValue(
      Item.create("id-1", ItemName.create("Widget"), Quantity.create(3)),
    );

    await expect(useCase.execute({ id: "id-1" })).resolves.toEqual({
      id: "id-1",
      name: "Widget",
      stock: 3,
      status: "active",
    });
    expect(items.findById).toHaveBeenCalledWith("id-1");
  });

  it("throws NotFoundError when the item does not exist", async () => {
    items.findById.mockResolvedValue(undefined);

    await expect(useCase.execute({ id: "missing" })).rejects.toThrow(
      NotFoundError,
    );
    await expect(useCase.execute({ id: "missing" })).rejects.toThrow(
      "Item 'missing' not found",
    );
  });
});
