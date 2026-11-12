import { tmpdir } from "node:os";
import { join } from "node:path";

import { EnvConfig } from "./env-config";

describe("EnvConfig", () => {
  it("uses defaults for missing values", () => {
    expect(EnvConfig.fromProcessEnv({})).toMatchObject({
      environment: "development",
      serviceName: "aws-node-ts-service",
      logLevel: "info",
      region: undefined,
      itemsFilePath: join(tmpdir(), "aws-node-ts-service-items.json"),
      isProduction: false,
    });
  });
  it("accepts known values", () => {
    expect(
      EnvConfig.fromProcessEnv({
        NODE_ENV: "production",
        SERVICE_NAME: "service",
        LOG_LEVEL: "debug",
        AWS_REGION: "eu-west-1",
        ITEMS_FILE_PATH: "/data/items.json",
      }),
    ).toMatchObject({
      environment: "production",
      serviceName: "service",
      logLevel: "debug",
      region: "eu-west-1",
      itemsFilePath: "/data/items.json",
      isProduction: true,
    });
  });
  it("falls back on unknown or blank values", () => {
    expect(
      EnvConfig.fromProcessEnv({
        NODE_ENV: "unknown",
        SERVICE_NAME: " ",
        LOG_LEVEL: "unknown",
      }),
    ).toMatchObject({
      environment: "development",
      serviceName: "aws-node-ts-service",
      logLevel: "info",
    });
  });
});
