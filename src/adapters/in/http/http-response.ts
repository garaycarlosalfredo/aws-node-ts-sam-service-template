import type { APIGatewayProxyResult } from "aws-lambda";
import type { ValidationIssue } from "@domain/errors";

export class HttpResponse {
  private constructor() {}

  public static ok<T>(data: T): APIGatewayProxyResult {
    return HttpResponse.json(200, { success: true, data });
  }

  public static created<T>(data: T): APIGatewayProxyResult {
    return HttpResponse.json(201, { success: true, data });
  }

  public static badRequest(
    message: string,
    errors?: readonly ValidationIssue[],
  ): APIGatewayProxyResult {
    return HttpResponse.json(400, HttpResponse.errorEnvelope(message, errors));
  }

  public static notFound(message: string): APIGatewayProxyResult {
    return HttpResponse.json(404, HttpResponse.errorEnvelope(message));
  }

  public static conflict(message: string): APIGatewayProxyResult {
    return HttpResponse.json(409, HttpResponse.errorEnvelope(message));
  }

  public static internalServerError(
    message = "Internal server error",
  ): APIGatewayProxyResult {
    return HttpResponse.json(500, HttpResponse.errorEnvelope(message));
  }

  private static errorEnvelope(
    message: string,
    errors?: readonly ValidationIssue[],
  ): object {
    return errors && errors.length > 0
      ? { success: false, message, errors }
      : { success: false, message };
  }

  private static json(statusCode: number, body: object): APIGatewayProxyResult {
    return {
      statusCode,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
  }
}
