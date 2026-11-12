import { tmpdir } from "node:os";
import { join } from "node:path";
import type { LogLevel } from "@application/ports/logger.port";

const ENVIRONMENTS = [
  "development",
  "test",
  "integration",
  "qa",
  "staging",
  "production",
] as const;
type Environment = (typeof ENVIRONMENTS)[number];
const LOG_LEVELS: readonly LogLevel[] = [
  "debug",
  "info",
  "warn",
  "error",
  "silent",
];

export class EnvConfig {
  private constructor(
    public readonly environment: Environment,
    public readonly serviceName: string,
    public readonly logLevel: LogLevel,
    public readonly region: string | undefined,
    public readonly itemsFilePath: string,
  ) {}

  public static fromProcessEnv(
    env: NodeJS.ProcessEnv = process.env,
  ): EnvConfig {
    const environment =
      ENVIRONMENTS.find((value) => value === env.NODE_ENV) ?? "development";
    const logLevel =
      LOG_LEVELS.find((value) => value === env.LOG_LEVEL) ?? "info";
    const serviceName = env.SERVICE_NAME?.trim() || "aws-node-ts-service";
    return new EnvConfig(
      environment,
      serviceName,
      logLevel,
      env.AWS_REGION,
      env.ITEMS_FILE_PATH?.trim() ||
        join(tmpdir(), `${serviceName}-items.json`),
    );
  }

  public get isProduction(): boolean {
    return this.environment === "production";
  }
}
