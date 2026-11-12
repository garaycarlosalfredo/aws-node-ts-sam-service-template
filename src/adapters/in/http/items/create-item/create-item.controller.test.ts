import type { APIGatewayProxyEvent } from "aws-lambda";
import { vi } from "vitest";

import { CreateItemController } from "./create-item.controller";

describe("CreateItemController", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const output = {
    id: "id-1",
    name: "Widget",
    stock: 5,
    status: "active" as const,
  };
  const useCase = { execute: vi.fn().mockResolvedValue(output) };
  const event = (body: unknown): APIGatewayProxyEvent =>
    ({
      body: JSON.stringify(body),
      path: "/items",
      httpMethod: "POST",
    }) as APIGatewayProxyEvent;

  it("creates an item and answers 201", async () => {
    const result = await new CreateItemController(logger, useCase).handle(
      event({ name: " Widget ", stock: 5 }),
    );

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual({ success: true, data: output });
    expect(useCase.execute).toHaveBeenCalledWith({ name: "Widget", stock: 5 });
  });

  it("defaults the stock to 0", async () => {
    await new CreateItemController(logger, useCase).handle(
      event({ name: "Widget" }),
    );

    expect(useCase.execute).toHaveBeenCalledWith({ name: "Widget", stock: 0 });
  });

  it.each([
    {},
    { name: "   " },
    { name: "Widget", stock: -1 },
    { name: "Widget", stock: 1.5 },
  ])("rejects invalid input %j without invoking the use case", async (body) => {
    const result = await new CreateItemController(logger, useCase).handle(
      event(body),
    );

    expect(result.statusCode).toBe(400);
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
