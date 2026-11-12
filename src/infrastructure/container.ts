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
import { EnvConfig } from "./config/env-config";

/**
 * Composition root: the only place that knows the concrete implementations.
 * Every dependency is created lazily and cached for the lifetime of the container.
 */
export class Container {
  private loggerInstance?: ConsoleLogger;
  private idGeneratorInstance?: UuidGenerator;
  private eventPublisherInstance?: LoggerEventPublisher;
  private itemRepositoryInstance?: FileItemRepository;
  private createItemInstance?: CreateItemUseCase;
  private getItemInstance?: GetItemUseCase;
  private removeItemStockInstance?: RemoveItemStockUseCase;
  private createItemControllerInstance?: CreateItemController;
  private getItemControllerInstance?: GetItemController;
  private removeItemStockControllerInstance?: RemoveItemStockController;

  constructor(private readonly env: EnvConfig = EnvConfig.fromProcessEnv()) {}

  public get logger(): ConsoleLogger {
    return (this.loggerInstance ??= new ConsoleLogger({
      serviceName: this.env.serviceName,
      level: this.env.logLevel,
      environment: this.env.environment,
    }));
  }
  public get idGenerator(): UuidGenerator {
    return (this.idGeneratorInstance ??= new UuidGenerator());
  }
  public get eventPublisher(): LoggerEventPublisher {
    return (this.eventPublisherInstance ??= new LoggerEventPublisher(
      this.logger,
    ));
  }
  public get itemRepository(): FileItemRepository {
    return (this.itemRepositoryInstance ??= new FileItemRepository(
      this.env.itemsFilePath,
    ));
  }
  public get createItemUseCase(): CreateItemUseCase {
    return (this.createItemInstance ??= new CreateItemUseCase(
      this.itemRepository,
      this.idGenerator,
      this.eventPublisher,
    ));
  }
  public get getItemUseCase(): GetItemUseCase {
    return (this.getItemInstance ??= new GetItemUseCase(this.itemRepository));
  }
  public get removeItemStockUseCase(): RemoveItemStockUseCase {
    return (this.removeItemStockInstance ??= new RemoveItemStockUseCase(
      this.itemRepository,
      this.eventPublisher,
    ));
  }
  public get createItemController(): CreateItemController {
    return (this.createItemControllerInstance ??= new CreateItemController(
      this.logger,
      this.createItemUseCase,
    ));
  }
  public get getItemController(): GetItemController {
    return (this.getItemControllerInstance ??= new GetItemController(
      this.logger,
      this.getItemUseCase,
    ));
  }
  public get removeItemStockController(): RemoveItemStockController {
    return (this.removeItemStockControllerInstance ??=
      new RemoveItemStockController(this.logger, this.removeItemStockUseCase));
  }
}
