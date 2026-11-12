import type { APIGatewayProxyEvent } from "aws-lambda";

import type { ItemOutput } from "@application/dto/item.dto";
import type { GetItemUseCasePort } from "@application/ports/get-item-use-case.port";
import type { LoggerPort } from "@application/ports/logger.port";

import { HttpController } from "../../http-controller";
import { getItemPathSchema, type GetItemPath } from "./get-item.schema";

export class GetItemController extends HttpController<GetItemPath, ItemOutput> {
  constructor(
    logger: LoggerPort,
    private readonly getItemUseCase: GetItemUseCasePort,
  ) {
    super(logger);
  }

  protected override parseRequest(event: APIGatewayProxyEvent): GetItemPath {
    return this.validate(getItemPathSchema, event.pathParameters ?? {});
  }

  protected override execute(request: GetItemPath): Promise<ItemOutput> {
    return this.getItemUseCase.execute(request);
  }
}
