# AWS Node.js + TypeScript Lambda Service Template

Cost-conscious AWS Lambda template using Node.js 24, TypeScript, AWS SAM, zod validation and class-based dependency injection.

## Architecture

DDD + hexagonal (ports and adapters) following the Clean Architecture dependency rule. Each repository is one microservice, i.e. one bounded context, so there are no `contexts/` folders. Every layer exists from the start; the `Item` example only shows how they work together.

```text
src/
├── domain/          business rules: Item aggregate, Quantity, ItemName, domain events, domain errors
├── application/     use cases, DTOs and all ports (input and output)
├── adapters/
│   ├── in/http/     API Gateway controllers, zod schemas (one folder per function)
│   ├── in/sqs/      placeholder for a queue consumer
│   └── out/         repository, event publisher, id generator, logger
└── infrastructure/  composition root (container.ts), config, Lambda handlers + function.yml
```

```text
API Gateway → handler → controller → use case → domain
                                         ↓
                                   output port ← adapter
```

| Layer          | Responsibility                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| domain         | Business rules and invariants. `Item` decides what is allowed and records domain events.                      |
| application    | Use cases: load the aggregate through a port, call the domain, save, publish its events, return a DTO.        |
| adapters/in    | Translate a delivery mechanism (API Gateway) into use-case inputs and results into responses. zod lives here. |
| adapters/out   | Implement output ports against concrete technology (files, databases, queues, SDKs).                          |
| infrastructure | Wires everything (`container.ts`), reads configuration and holds the provider entrypoints.                    |

Dependencies point inwards: `domain ← application ← adapters ← infrastructure`. Ports belong to the layer that needs them, so all of them live in `application/ports`. Input and output adapters never import each other.

These rules are enforced by ESLint (`no-restricted-imports` in `eslint.config.mjs`), so `npm run lint` fails if, for example, `domain` imports an adapter or `zod`, or an output adapter imports an input adapter.

**Provider portability.** Input adapters use API Gateway types (`APIGatewayProxyEvent`, `APIGatewayProxyResult`) on purpose. Translating what the provider sends into what the application uses is exactly the job of an adapter, so these types belong in `src/adapters/in/http` (`http-controller.ts`, `http-response.ts`) and nowhere else. This is not a weakness to fix: a different provider has a different request, SDK and types, and it is served by a different adapter.

Moving to GCP, Azure or any other provider (which also replaces AWS SAM):

| Stays unchanged                                        | Is replaced or added                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `domain` and `application`, with their tests           | Input adapters (`adapters/in/http`): provider request/response types and controllers |
| Generic output adapters (logger, ID generator, events) | Output adapters that depend on the provider (e.g. the repository, event publisher)   |
| `Container` (only the adapters it instantiates change) | `infrastructure` entrypoints (`aws/lambda`) and deployment config (`template.yaml`)  |

The zod schemas can be reused if the new input adapter keeps them. The ESLint boundaries guarantee that the core cannot depend on the provider, so replacing the adapters does not require touching it. Equivalent delivery, storage and failure semantics still need to be verified.

**Domain events.** `Item` records `ItemCreated` and `ItemStockDepleted`. After saving, use cases hand `item.pullEvents()` to `EventPublisherPort`. The example adapter only logs them; a real service would publish to SNS, EventBridge or SQS.

Tests live beside their subject and shared fixtures in `tests/helpers`.

## Getting started

Requirements:

- Node.js 24 (see `.nvmrc`) and npm.
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).
- Docker running: `sam local` executes each Lambda inside a container.
- Lambda architecture: deployed stages use `arm64` (the `Architecture` parameter default in `template.yaml`, cheaper on AWS). `npm start` reads the `[development]` section of `samconfig.toml`, where `Architecture=x86_64` is set by hand so it runs without emulation on Intel/AMD machines. On Apple Silicon or Linux arm64, change it to `arm64`. The code is plain JavaScript, so both architectures behave the same.

Run the service locally with SAM (it builds with esbuild and serves the API on port 4040):

```sh
npm install
npm start
```

In another terminal:

```sh
curl -X POST http://127.0.0.1:4040/items -H 'Content-Type: application/json' -d '{"name":"Widget","stock":5}'
curl http://127.0.0.1:4040/items/<id>
curl -X POST http://127.0.0.1:4040/items/<id>/remove-stock -H 'Content-Type: application/json' -d '{"amount":2}'
```

`POST /items` requires `name` (1–100 characters after trimming) and accepts an integer `stock >= 0` (default 0). `remove-stock` requires a positive integer `amount`.

The example stores items in a local JSON file (`<tmp dir>/<service>-items.json`, or `ITEMS_FILE_PATH`) through `FileItemRepository`, so every function shares them. It is only meant for local development: on AWS the file system is ephemeral and not shared between instances. Replace it with a persistent adapter before deploying.

Invoke the examples without starting the HTTP server:

```sh
sam build && sam local invoke CreateItemFunction -e events/create-item.json
sam local invoke GetItemFunction -e events/get-item.json
sam local invoke RemoveItemStockFunction -e events/remove-item-stock.json
```

## Scripts

| Command                                   | Purpose                               |
| ----------------------------------------- | ------------------------------------- |
| `npm start`                               | Run `sam local start-api` (port 4040) |
| `npm run build` / `npm run typecheck`     | Type-check without emitting files     |
| `npm run lint` / `npm run lint:fix`       | Check / fix lint issues               |
| `npm run format` / `npm run format:check` | Format / check formatting             |
| `npm test` / `npm run test:watch`         | Run / watch Jest tests                |
| `npm run test:coverage`                   | Run tests with a 90% line threshold   |
| `npm run package`                         | Validate and build the SAM package    |
| `npm run deploy` / `npm run remove`       | Deploy / remove the service in AWS    |

## Configuration and deployment

The stages are `development` (local only, `npm start`), `integration` and `production` (deployed). The `StageConfig` mapping in `template.yaml` holds a `default` entry plus per-stage overrides (the `Stage` parameter selects it, falling back to `default`). It sets log retention, log level and `NODE_OPTIONS` (`--enable-source-maps` in development). The region and per-stage stack settings live in `samconfig.toml`. The Lambda environment uses `NODE_ENV`, `SERVICE_NAME`, `LOG_LEVEL` and AWS-provided `AWS_REGION`. Invalid environment or log level values fall back to development and info. Lambda uses the default automatic runtime update mode so AWS can apply runtime security updates; update dependencies separately.

To deploy, configure your AWS account and credentials separately, review `template.yaml` and `samconfig.toml`, then run `npm run deploy -- integration` or `npm run deploy -- production` (they pick the `samconfig.toml` environment). Deployment creates AWS resources. Verify `nodejs24.x` support in the target account/region before deployment.

## Costs and alarms

Lambda, API Gateway, CloudWatch Logs, deployments and other AWS resources can incur charges depending on usage and region. Default log retention is 7 days (development and integration) and 14 in production. An SSM standard parameter publishes the service URL. CloudWatch alarms are disabled by default. To enable them, add `AWS::CloudWatch::Alarm` resources to `template.yaml`, conditioned on the stages and configure an SNS action if notifications are needed; alarms add recurring charges. X-Ray, provisioned concurrency, CORS, API keys and authorizers are not enabled.

## HTTP and extension conventions

Success responses use `{ "success": true, "data": ... }` (201 for creations); errors use `{ "success": false, "message": "...", "errors": [...] }`, with `errors` omitted when empty. Validation errors map to 400, not-found errors to 404, invalid state transitions (`InvalidStateError`) to 409 and unexpected errors to a generic 500.

To add an endpoint:

1. Put the business rules in `domain` (entities, value objects, errors); keep them independent of HTTP and AWS.
2. Add a use case, its DTOs, its input port and any output port in `application`.
3. Add the zod schema and controller under `src/adapters/in/http/<resource>/<function>/`, plus any output adapter in `src/adapters/out`.
4. Wire dependencies in `Container`; add `src/infrastructure/aws/lambda/<function>/lambda.ts` and declare a new `AWS::Serverless::Function` in `template.yaml`.
5. Add tests and an example event, then run lint, build, coverage and package.

Ports end in `Port`; dependencies are injected through constructors. Validate at the HTTP boundary and keep zod out of the domain and application layers.

## Logging recommendations

These are suggestions, not rules; adapt them to the service.

- `domain` cannot log because it depends on nothing. Throw a domain error or record a domain event; `LoggerEventPublisher` logs events.
- `application`, `adapters` and `infrastructure` can log. Inject `LoggerPort` (defined in `application/ports`) through the constructor and pass it from `Container`; in tests use a mock.
- Avoid logging and rethrowing the same error in every layer, which duplicates entries. `HttpController` already logs every error at the HTTP boundary.
- In a use case, log when it adds context the controller lacks (operation, `itemId`) or when you catch an error without rethrowing it.
- In an output adapter, log the technical failure with its details and rethrow it wrapped in an error of your own, so upper layers do not depend on infrastructure details.

```ts
try {
  // load, call the domain, save, publish events
} catch (error) {
  this.logger.warn("Could not remove stock", { itemId: input.id, error });
  throw error; // the controller maps it to an HTTP response
}
```

## Using this template for a new service

1. **Rename the service** in `package.json`, `template.yaml` and `samconfig.toml`, and review the `StageConfig` mapping.
2. **Replace the example domain.** Rename or delete `Item`, `ItemName`, `Quantity` and the item events in `src/domain` and write your own entities, value objects and rules first, with tests.
3. **Replace the use cases and ports** in `src/application` (`create-item`, `get-item`, `remove-item-stock`, `item-repository.port`). Keep `logger.port`, `id-generator.port` and `event-publisher.port` if you need them.
4. **Replace the HTTP adapters** in `src/adapters/in/http/items` and update `HttpController`'s error mapping if you add new domain errors.
5. **Swap the file repository** for a persistent adapter (see `src/adapters/out/README.md`) and add the IAM permissions in `template.yaml`.
6. **Rewire** `src/infrastructure/container.ts`, the Lambda folders under `src/infrastructure/aws/lambda`, the function list in `template.yaml` and the sample events in `events/`.
7. Run `npm run lint`, `npm run build`, `npm run test:coverage` and `npm run package`.
