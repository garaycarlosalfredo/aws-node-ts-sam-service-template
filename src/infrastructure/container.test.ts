import { CreateItemController } from "@adapters/in/http/items/create-item/create-item.controller";
import { GetItemController } from "@adapters/in/http/items/get-item/get-item.controller";
import { RemoveItemStockController } from "@adapters/in/http/items/remove-item-stock/remove-item-stock.controller";
import { LoggerEventPublisher } from "@adapters/out/events/logger-event-publisher";
import { UuidGenerator } from "@adapters/out/id/uuid-generator";
import { ConsoleLogger } from "@adapters/out/logger/console.logger";
import { FileItemRepository } from "@adapters/out/persistence/file-item.repository";
import { CreateItemUseCase } from "@application/use-cases/create-item.use-case";
import { GetItemUseCase } from "@application/use-cases/get-item.use-case";
import { RemoveItemStockUseCase } from "@application/use-cases/remove-item-stock.use-case";
import { Container } from "./container";
import { EnvConfig } from "./config/env-config";

describe("Container", () => {
  it("creates and caches each dependency", () => {
    const container = new Container(
      EnvConfig.fromProcessEnv({ LOG_LEVEL: "silent" }),
    );

    expect(container.logger).toBeInstanceOf(ConsoleLogger);
    expect(container.idGenerator).toBeInstanceOf(UuidGenerator);
    expect(container.eventPublisher).toBeInstanceOf(LoggerEventPublisher);
    expect(container.itemRepository).toBeInstanceOf(FileItemRepository);
    expect(container.createItemUseCase).toBeInstanceOf(CreateItemUseCase);
    expect(container.getItemUseCase).toBeInstanceOf(GetItemUseCase);
    expect(container.removeItemStockUseCase).toBeInstanceOf(
      RemoveItemStockUseCase,
    );
    expect(container.createItemController).toBeInstanceOf(CreateItemController);
    expect(container.getItemController).toBeInstanceOf(GetItemController);
    expect(container.removeItemStockController).toBeInstanceOf(
      RemoveItemStockController,
    );

    expect(container.logger).toBe(container.logger);
    expect(container.idGenerator).toBe(container.idGenerator);
    expect(container.eventPublisher).toBe(container.eventPublisher);
    expect(container.itemRepository).toBe(container.itemRepository);
    expect(container.createItemUseCase).toBe(container.createItemUseCase);
    expect(container.getItemUseCase).toBe(container.getItemUseCase);
    expect(container.removeItemStockUseCase).toBe(
      container.removeItemStockUseCase,
    );
    expect(container.createItemController).toBe(container.createItemController);
    expect(container.getItemController).toBe(container.getItemController);
    expect(container.removeItemStockController).toBe(
      container.removeItemStockController,
    );
  });

  it("shares one repository between the use cases of a container", () => {
    const container = new Container(
      EnvConfig.fromProcessEnv({ LOG_LEVEL: "silent" }),
    );

    expect(container.itemRepository).toBe(container.itemRepository);
    expect(container.createItemUseCase).not.toBe(container.getItemUseCase);
  });

  it("creates a container with default configuration", () => {
    expect(new Container().logger).toBeInstanceOf(ConsoleLogger);
  });
});
