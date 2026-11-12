import type { DomainEvent } from "@domain/events";

/** Output port: how the application announces domain events (queue, bus, log...). */
export interface EventPublisherPort {
  publish(events: readonly DomainEvent[]): Promise<void>;
}
