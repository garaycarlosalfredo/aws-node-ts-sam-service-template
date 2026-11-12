import type { APIGatewayProxyEvent } from "aws-lambda";
import { vi } from "vitest";

import { NotFoundError } from "@domain/errors";

import { GetItemController } from "./get-item.controller";

describe("GetItemController", () => {
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
  const useCase = { execute: vi.fn() };
  const event = (
    pathParameters: Record<string, string | undefined> | null,
  ): APIGatewayProxyEvent =>
    ({
      pathParameters,
      path: "/items/id-1",
      httpMethod: "GET",
    }) as APIGatewayProxyEvent;

  it("returns the item", async () => {
    useCase.execute.mockResolvedValue(output);

    const result = await new GetItemController(logger, useCase).handle(
      event({ id: "id-1" }),
    );

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ success: true, data: output });
    expect(useCase.execute).toHaveBeenCalledWith({ id: "id-1" });
  });

  it("answers 404 when the item does not exist", async () => {
    useCase.execute.mockRejectedValue(new NotFoundError("Item", "id-1"));

    const result = await new GetItemController(logger, useCase).handle(
      event({ id: "id-1" }),
    );

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({
      success: false,
      message: "Item 'id-1' not found",
    });
  });

  it.each([null, {}, { id: "  " }])(
    "rejects a missing id %j",
    async (pathParameters) => {
      const result = await new GetItemController(logger, useCase).handle(
        event(pathParameters),
      );

      expect(result.statusCode).toBe(400);
      expect(useCase.execute).not.toHaveBeenCalled();
    },
  );
});
