# SQS input adapter (not implemented)

Placeholder for a driving adapter that consumes queue messages.

An SQS adapter would:

1. Receive an `SQSEvent` from a Lambda entrypoint in `src/infrastructure/aws/lambda`.
2. Parse and validate each message body (zod lives in the input adapters only).
3. Call the same use-case ports used by the HTTP adapters.
4. Own queue-specific concerns: partial batch failures, retries, dead-letter handling.

Use cases never know whether a request came from HTTP, SQS or any other source.
