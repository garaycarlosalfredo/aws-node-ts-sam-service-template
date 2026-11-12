import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import type { ZodType } from "zod";
import {
  DomainError,
  InvalidStateError,
  NotFoundError,
  ValidationError,
} from "@domain/errors";
import type { LoggerPort } from "@application/ports/logger.port";
import { HttpResponse } from "./http-response";

export abstract class HttpController<TRequest, TResponse> {
  protected constructor(private readonly logger: LoggerPort) {}

  public async handle(
    event: APIGatewayProxyEvent,
    context?: Context,
  ): Promise<APIGatewayProxyResult> {
    const requestMeta = {
      path: event.path,
      httpMethod: event.httpMethod,
      requestId: event.requestContext?.requestId,
      awsRequestId: context?.awsRequestId,
    };
    this.logger.info("Received request", requestMeta);
    try {
      const request = this.parseRequest(event);
      const response = await this.execute(request);
      const result = this.successResponse(response);
      this.logger.info("Successfully processed request", {
        ...requestMeta,
        statusCode: result.statusCode,
      });
      return result;
    } catch (error: unknown) {
      const result = this.toHttpResponse(error);
      this.logger.error(
        "An error occurred while processing the request",
        error instanceof Error ? error : new Error(String(error)),
        { ...requestMeta, statusCode: result.statusCode },
      );
      return result;
    }
  }

  /** Override to answer with a status other than 200 (e.g. 201 for creations). */
  protected successResponse(data: TResponse): APIGatewayProxyResult {
    return HttpResponse.ok(data);
  }

  protected abstract parseRequest(event: APIGatewayProxyEvent): TRequest;
  protected abstract execute(request: TRequest): Promise<TResponse>;

  protected validate<T>(schema: ZodType<T>, payload: unknown): T {
    const result = schema.safeParse(payload);
    if (!result.success) {
      throw new ValidationError(
        "Validation failed",
        result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          code: issue.code,
          message: issue.message,
        })),
      );
    }
    return result.data;
  }

  protected parseJsonBody(event: APIGatewayProxyEvent): unknown {
    if (!event.body) return {};
    try {
      return JSON.parse(event.body) as unknown;
    } catch {
      throw new ValidationError("Request body is not valid JSON");
    }
  }

  private toHttpResponse(error: unknown): APIGatewayProxyResult {
    if (error instanceof ValidationError)
      return HttpResponse.badRequest(error.message, error.details);
    if (error instanceof NotFoundError)
      return HttpResponse.notFound(error.message);
    if (error instanceof InvalidStateError)
      return HttpResponse.conflict(error.message);
    if (error instanceof DomainError)
      return HttpResponse.badRequest(error.message);
    return HttpResponse.internalServerError();
  }
}
