import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import { z } from "zod";
import {
  DomainError,
  InvalidStateError,
  NotFoundError,
  ValidationError,
} from "@domain/errors";
import type { LoggerPort } from "@application/ports/logger.port";
import { HttpController } from "./http-controller";

class OtherDomainError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

class TestController extends HttpController<
  { name: string },
  { name: string }
> {
  constructor(
    logger: LoggerPort,
    private readonly failure?: unknown,
  ) {
    super(logger);
  }
  protected override parseRequest(event: APIGatewayProxyEvent): {
    name: string;
  } {
    return this.validate(
      z.object({ name: z.string() }),
      this.parseJsonBody(event),
    );
  }
  protected override async execute(request: {
    name: string;
  }): Promise<{ name: string }> {
    if (this.failure !== undefined) throw this.failure;
    return request;
  }
}

describe("HttpController", () => {
  const logger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  const event = (body: string | null): APIGatewayProxyEvent =>
    ({
      body,
      path: "/test",
      httpMethod: "POST",
      requestContext: { requestId: "request-1" },
    }) as APIGatewayProxyEvent;

  it("returns success and logs request metadata", async () => {
    const result = await new TestController(logger).handle(
      event('{"name":"Ada"}'),
      {
        awsRequestId: "aws-1",
      } as Context,
    );
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      success: true,
      data: { name: "Ada" },
    });
    expect(logger.info).toHaveBeenNthCalledWith(1, "Received request", {
      path: "/test",
      httpMethod: "POST",
      requestId: "request-1",
      awsRequestId: "aws-1",
    });
    expect(logger.info).toHaveBeenNthCalledWith(
      2,
      "Successfully processed request",
      expect.objectContaining({ statusCode: 200 }),
    );
  });

  it("returns validation issues for invalid input", async () => {
    const result = await new TestController(logger).handle(event("{}"));
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toMatchObject({
      success: false,
      message: "Validation failed",
      errors: [{ path: "name" }],
    });
    expect(logger.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(ValidationError),
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  it.each([null, ""])(
    "treats empty body %p as an empty object",
    async (body) => {
      const result = await new TestController(logger).handle(event(body));
      expect(JSON.parse(result.body)).toMatchObject({
        message: "Validation failed",
        errors: [{ path: "name" }],
      });
    },
  );

  it("returns a validation error for malformed JSON", async () => {
    const result = await new TestController(logger).handle(event("{"));
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      message: "Request body is not valid JSON",
    });
  });

  it.each([
    [new ValidationError("Invalid"), 400, "Invalid"],
    [new NotFoundError("User"), 404, "User not found"],
    [new InvalidStateError("Item is archived"), 409, "Item is archived"],
    [new OtherDomainError("Domain failure"), 400, "Domain failure"],
    [new Error("secret"), 500, "Internal server error"],
    ["unexpected", 500, "Internal server error"],
  ])("maps thrown errors to HTTP responses", async (error, status, message) => {
    const result = await new TestController(logger, error).handle(
      event('{"name":"Ada"}'),
    );
    expect(result.statusCode).toBe(status);
    expect(JSON.parse(result.body)).toEqual({ success: false, message });
    expect(logger.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Error),
      expect.objectContaining({ statusCode: status }),
    );
    if (typeof error === "string")
      expect(logger.error.mock.calls[0][1].message).toBe(error);
  });
});
