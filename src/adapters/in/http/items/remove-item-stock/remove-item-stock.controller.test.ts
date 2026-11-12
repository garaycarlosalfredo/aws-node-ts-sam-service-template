import type { APIGatewayProxyEvent } from "aws-lambda";
import { vi } from "vitest";

import { InvalidStateError, ValidationError } from "@domain/errors";

import { RemoveItemStockController } from "./remove-item-stock.controller";

describe("RemoveItemStockController", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const output = {
    id: "id-1",
    name: "Widget",
    stock: 3,
    status: "active" as const,
  };
  const useCase = { execute: vi.fn() };
  const event = (
    pathParameters: Record<string, string> | null,
    body: unknown,
  ): APIGatewayProxyEvent =>
    ({
      pathParameters,
      body: JSON.stringify(body),
      path: "/items/id-1/remove-stock",
      httpMethod: "POST",
    }) as APIGatewayProxyEvent;

  it("combines the path id and the body amount", async () => {
    useCase.execute.mockResolvedValue(output);

    const result = await new RemoveItemStockController(logger, useCase).handle(
      event({ id: "id-1" }, { amount: 2 }),
    );

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ success: true, data: output });
    expect(useCase.execute).toHaveBeenCalledWith({ id: "id-1", amount: 2 });
  });

  it.each([
    [{ id: "id-1" }, {}],
    [{ id: "id-1" }, { amount: 0 }],
    [{ id: "id-1" }, { amount: 1.5 }],
    [null, { amount: 1 }],
  ])("rejects invalid input (%j, %j)", async (pathParameters, body) => {
    const result = await new RemoveItemStockController(logger, useCase).handle(
      event(pathParameters, body),
    );

    expect(result.statusCode).toBe(400);
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  it("answers 409 when the item is archived", async () => {
    useCase.execute.mockRejectedValue(
      new InvalidStateError("Item is archived"),
    );

    const result = await new RemoveItemStockController(logger, useCase).handle(
      event({ id: "id-1" }, { amount: 1 }),
    );

    expect(result.statusCode).toBe(409);
  });

  it("answers 400 when the domain rejects the amount", async () => {
    useCase.execute.mockRejectedValue(new ValidationError("Not enough stock"));

    const result = await new RemoveItemStockController(logger, useCase).handle(
      event({ id: "id-1" }, { amount: 10 }),
    );

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      message: "Not enough stock",
    });
  });
});
