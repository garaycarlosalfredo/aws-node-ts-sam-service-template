import type { LoggerPort, LogMeta } from "@application/ports/logger.port";

export interface LogEntry {
  level: string;
  message: string;
  meta?: LogMeta;
  error?: Error;
}
export class FakeLogger implements LoggerPort {
  public readonly entries: LogEntry[] = [];
  public debug(message: string, meta?: LogMeta): void {
    this.entries.push({ level: "debug", message, meta });
  }
  public info(message: string, meta?: LogMeta): void {
    this.entries.push({ level: "info", message, meta });
  }
  public warn(message: string, meta?: LogMeta): void {
    this.entries.push({ level: "warn", message, meta });
  }
  public error(message: string, error?: Error, meta?: LogMeta): void {
    this.entries.push({ level: "error", message, error, meta });
  }
  public entriesAtLevel(level: string): LogEntry[] {
    return this.entries.filter((entry) => entry.level === level);
  }
}
