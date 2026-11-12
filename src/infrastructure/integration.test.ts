import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { buildApiGatewayEvent } from "@tests/helpers/api-gateway-event.helper";
import { Container } from "./container";
import { EnvConfig } from "./config/env-config";

describe("HTTP integration", () => {
  let directory: string;
  let newContainer: () => Container;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "integration-"));
    newContainer = () =>
      new Container(
        EnvConfig.fromProcessEnv({
          LOG_LEVEL: "silent",
          ITEMS_FILE_PATH: join(directory, "items.json"),
        }),
      );
  });

  afterEach(() => rm(directory, { recursive: true, force: true }));

  const body = (response: {
    body: string;
  }): { data: Record<string, unknown> } => JSON.parse(response.body);

  const createItem = async (
    container: Container,
    stock = 5,
  ): Promise<string> => {
    const created = await container.createItemController.handle(
      buildApiGatewayEvent({
        httpMethod: "POST",
        body: JSON.stringify({ name: " Widget ", stock }),
      }),
    );
    expect(created.statusCode).toBe(201);
    return body(created).data.id as string;
  };

  it("creates, consumes stock and reads an item, each step in a different container", async () => {
    // Each Lambda function builds its own container; they only share the persistence.
    const id = await createItem(newContainer());

    const removed = await newContainer().removeItemStockController.handle(
      buildApiGatewayEvent({
        httpMethod: "POST",
        pathParameters: { id },
        body: JSON.stringify({ amount: 2 }),
      }),
    );
    expect(removed.statusCode).toBe(200);

    const fetched = await newContainer().getItemController.handle(
      buildApiGatewayEvent({ pathParameters: { id } }),
    );
    expect(fetched.statusCode).toBe(200);
    expect(body(fetched).data).toEqual({
      id,
      name: "Widget",
      stock: 3,
      status: "active",
    });
  });

  it("enforces domain rules end to end", async () => {
    const container = newContainer();
    const id = await createItem(container, 1);

    const tooMuch = await container.removeItemStockController.handle(
      buildApiGatewayEvent({
        httpMethod: "POST",
        pathParameters: { id },
        body: JSON.stringify({ amount: 2 }),
      }),
    );

    expect(tooMuch.statusCode).toBe(400);
    expect(JSON.parse(tooMuch.body)).toEqual({
      success: false,
      message: "Not enough stock",
    });
  });

  it("answers 404 for an unknown item", async () => {
    const response = await newContainer().getItemController.handle(
      buildApiGatewayEvent({ pathParameters: { id: "missing" } }),
    );

    expect(response.statusCode).toBe(404);
  });
});
