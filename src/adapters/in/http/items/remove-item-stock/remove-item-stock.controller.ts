import type { APIGatewayProxyEvent } from "aws-lambda";

import type { ItemOutput } from "@application/dto/item.dto";
import type { LoggerPort } from "@application/ports/logger.port";
import type { RemoveItemStockUseCasePort } from "@application/ports/remove-item-stock-use-case.port";

import { HttpController } from "../../http-controller";
import {
  removeItemStockBodySchema,
  removeItemStockPathSchema,
  type RemoveItemStockRequest,
} from "./remove-item-stock.schema";

export class RemoveItemStockController extends HttpController<
  RemoveItemStockRequest,
  ItemOutput
> {
  constructor(
    logger: LoggerPort,
    private readonly removeItemStockUseCase: RemoveItemStockUseCasePort,
  ) {
    super(logger);
  }

  protected override parseRequest(
    event: APIGatewayProxyEvent,
  ): RemoveItemStockRequest {
    return {
      ...this.validate(removeItemStockPathSchema, event.pathParameters ?? {}),
      ...this.validate(removeItemStockBodySchema, this.parseJsonBody(event)),
    };
  }

  protected override execute(
    request: RemoveItemStockRequest,
  ): Promise<ItemOutput> {
    return this.removeItemStockUseCase.execute(request);
  }
}
