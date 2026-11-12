import type { APIGatewayProxyEvent } from "aws-lambda";

export function buildApiGatewayEvent(
  overrides: Partial<APIGatewayProxyEvent> = {},
): APIGatewayProxyEvent {
  return {
    body: null,
    path: "/test",
    httpMethod: "GET",
    queryStringParameters: null,
    requestContext: { requestId: "request-1" },
    ...overrides,
  } as APIGatewayProxyEvent;
}
