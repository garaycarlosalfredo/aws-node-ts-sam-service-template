# AGENTS.md

Instructions for AI agents working in this repository.

## Git is user-only

- **The user is the only person who uses Git in this repository.**
- **Do not run any Git command**, including read-only ones: `git status`, `git diff`, `git log`, `git add`, `git commit`, `git push`, `git checkout`, `git restore`, `git tag`, `git stash`, etc.
- Do not create, modify, publish or configure GitHub repositories. Do not run `gh`.
- The user reviews changes, commits and pushes. Wait for the user to do it.
- If you need a remote URL, an account or any external data, ask the user and wait for the answer.

## Documentation

- Planning, decisions and task status live in the user's Obsidian vault, outside this repository.
- Do not recreate `docs/PLAN.md` or duplicate the plan here.
- This repository contains code, configuration and the README only.

## Workflow

- Work one small slice at a time: explain → change → verify → pause for review.
- Do not chain phases without an explicit request.
- If a check fails, fix that slice before moving on.
- Do not claim a task is complete without running its verification or recording why it could not run.

## Language

- Code, comments, README, configuration and messages: English.
- Conversation and vault notes: Spanish.

## Verification

```bash
npm run lint
npm run build
npm run test:coverage
npm run package
```

`npm run package` validates `serverless.yml` and the esbuild bundle. If it fails because of `runtimeManagement`, remove that property from `serverless.yml` and retry.

## AWS and secrets

- Do not run `serverless deploy`, `serverless remove` or any AWS command that creates, changes or deletes resources.
- Do not read or print `.env`, credentials, tokens, SSH keys or secret managers. Use `.env.example` only.
- Do not write secrets into notes, commits, logs or responses.

## Design rules

- Hexagonal architecture with DDD: `domain` depends on nothing; `application` depends only on `domain`; `adapters` depend on `application` and `domain`; `infrastructure` wires everything.
- Each repository is one microservice and therefore one bounded context: no `contexts/` or `shared/` folders.
- Business rules and invariants live in `domain` (entities, value objects, domain errors). Use cases only coordinate: load, call the domain, save, map to a DTO.
- All ports (input and output) live in `src/application/ports`. Output adapters implement them in `src/adapters/out`; input adapters call the input ports from `src/adapters/in`.
- Changing provider means adding or replacing adapters and `src/infrastructure`; `domain` and `application` do not change.
- Layer boundaries are enforced by `no-restricted-imports` in `eslint.config.mjs`. Do not weaken those rules to make an import compile; fix the dependency direction instead.
- Generic infrastructure code (e.g. `HttpController`) must not reference example-specific classes; map generic domain errors only.
- Classes with constructor injection. No `pipe`/`compose`, no global state, no dependencies injected through `requestContext`.
- zod only in `src/adapters/in/http`.
- No `any`.
- Do not add runtime dependencies without justification and a recorded decision.
