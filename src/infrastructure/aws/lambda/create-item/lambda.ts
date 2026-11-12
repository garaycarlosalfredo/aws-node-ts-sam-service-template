import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Container } from "@infrastructure/container";

const controller = new Container().createItemController;
export const handler = (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => controller.handle(event, context);
