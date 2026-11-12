import { ValidationError } from "@domain/errors";
import { ItemCreated } from "@domain/events";
import type { Item } from "@domain/models/item";

import type { EventPublisherPort } from "../ports/event-publisher.port";
import type { IdGeneratorPort } from "../ports/id-generator.port";
import type { ItemRepositoryPort } from "../ports/item-repository.port";
import { CreateItemUseCase } from "./create-item.use-case";

describe("CreateItemUseCase", () => {
  const items: jest.Mocked<ItemRepositoryPort> = {
    findById: jest.fn(),
    save: jest.fn(),
  };
  const idGenerator: jest.Mocked<IdGeneratorPort> = {
    generate: jest.fn().mockReturnValue("id-1"),
  };
  const events: jest.Mocked<EventPublisherPort> = { publish: jest.fn() };
  const useCase = new CreateItemUseCase(items, idGenerator, events);

  it("creates an active item, stores it and returns its output", async () => {
    const output = await useCase.execute({ name: "  Widget ", stock: 5 });

    expect(output).toEqual({
      id: "id-1",
      name: "Widget",
      stock: 5,
      status: "active",
    });
    expect(items.save).toHaveBeenCalledTimes(1);
    const saved = items.save.mock.calls[0][0] as Item;
    expect(saved.id).toBe("id-1");
    expect(saved.stock.value).toBe(5);
  });

  it("publishes the ItemCreated event after storing the item", async () => {
    await useCase.execute({ name: "Widget", stock: 5 });

    expect(events.publish).toHaveBeenCalledWith([new ItemCreated("id-1", 5)]);
    expect(items.save.mock.invocationCallOrder[0]).toBeLessThan(
      events.publish.mock.invocationCallOrder[0],
    );
  });

  it("does not store anything when the domain rejects the input", async () => {
    await expect(useCase.execute({ name: "   ", stock: 1 })).rejects.toThrow(
      ValidationError,
    );
    await expect(
      useCase.execute({ name: "Widget", stock: -1 }),
    ).rejects.toThrow(ValidationError);
    expect(items.save).not.toHaveBeenCalled();
    expect(events.publish).not.toHaveBeenCalled();
  });
});
