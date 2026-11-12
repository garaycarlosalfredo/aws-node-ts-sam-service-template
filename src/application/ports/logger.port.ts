export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";
export type LogMeta = Record<string, unknown>;

export interface LoggerPort {
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, error?: Error, meta?: LogMeta): void;
}
