import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import type { ItemOutput } from "@application/dto/item.dto";
import type { CreateItemUseCasePort } from "@application/ports/create-item-use-case.port";
import type { LoggerPort } from "@application/ports/logger.port";

import { HttpController } from "../../http-controller";
import { HttpResponse } from "../../http-response";
import {
  createItemBodySchema,
  type CreateItemBody,
} from "./create-item.schema";

export class CreateItemController extends HttpController<
  CreateItemBody,
  ItemOutput
> {
  constructor(
    logger: LoggerPort,
    private readonly createItemUseCase: CreateItemUseCasePort,
  ) {
    super(logger);
  }

  protected override parseRequest(event: APIGatewayProxyEvent): CreateItemBody {
    return this.validate(createItemBodySchema, this.parseJsonBody(event));
  }

  protected override execute(request: CreateItemBody): Promise<ItemOutput> {
    return this.createItemUseCase.execute(request);
  }

  protected override successResponse(data: ItemOutput): APIGatewayProxyResult {
    return HttpResponse.created(data);
  }
}
