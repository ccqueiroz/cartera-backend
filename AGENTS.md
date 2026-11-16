# AGENTS.md — cartera-backend

Code rules for anyone, person or agent, who changes this repository. Each rule line ends with the sensor that checks it: `[sensor: <file or package.json script>]`, or `[no sensor]` when only review checks it.

## Stack

| Layer                    | Technology                                                         |
| ------------------------ | ------------------------------------------------------------------ |
| Runtime and language     | Node 20, TypeScript 6 `strict`, alias `@/` for `src/`              |
| HTTP                     | Express 5                                                          |
| Persistence and auth     | Firebase Admin: Firestore, and Firebase Auth with a session cookie |
| Cache                    | Redis 6                                                            |
| Validation               | `class-validator` and `class-transformer`, at the HTTP border      |
| Logs, docs, build, tests | winston, swagger-jsdoc, tsup, Jest with ts-jest                    |

Dependency injection is manual: each feature exposes a factory, and `src/bootstrap/main.ts` is the only composition root.

## Folder structure

```text
src/
  features/<feature>/          one vertical slice per feature
    domain/                    entities, value objects, ports (interfaces)
    application/               use cases
    infra/http/                routes, controller, schemas, <feature>.routes.ts
    infra/persistence/         repository adapters (Firestore, in memory)
    <feature>.factory.ts       builds the slice and returns its routes
  features/core-finance/       bills, receivables and the internal transaction-engine
  shared/kernel/               value objects, domain errors, error codes
  shared/http/                 Express app, route contract, middlewares, swagger
  shared/database/             Firestore and Redis connections
  shared/query/                pagination helpers
  shared/logger/               logger adapter
  packages/clients/            wrappers of third-party libraries
  bootstrap/                   main.ts and the adapters between features
```

## Dependencies

- A feature never imports another feature: the consumer declares a port in its `domain/ports/`, and an adapter in `src/bootstrap/` implements it. [sensor: .dependency-cruiser.cjs]
- No import cycles. [sensor: .dependency-cruiser.cjs]
- `src/shared/kernel/` imports nothing outside itself. [sensor: .dependency-cruiser.cjs]
- `domain/` and `application/` never import Express, `src/shared/http/`, an `infra/` folder or `src/bootstrap/`. [sensor: .dependency-cruiser.cjs .eslintrc.json]
- `domain/` and `application/` never import an npm package, `src/packages/` or `src/shared/database/`; a warning until the change that clears the known violations. [sensor: .dependency-cruiser.cjs]
- `src/packages/` never imports `src/features/`, `src/shared/` or `src/bootstrap/`; a warning until the change that clears the known violations. [sensor: .dependency-cruiser.cjs]
- A gateway adapter in `src/bootstrap/` never touches the database (`firebase-admin` or `src/shared/database/`); a warning until the change that clears the known violations. [sensor: .dependency-cruiser.cjs]
- `transaction-engine` is imported only inside `src/features/core-finance/` and wired in `src/bootstrap/`; no `infra/http/` folder imports it. [sensor: .dependency-cruiser.cjs .eslintrc.json]
- `src/shared/http/` never imports `src/features/`, and a `*.route.ts` file exists only in `src/features/<feature>/infra/http/`. [sensor: .eslintrc.json .dependency-cruiser.cjs]

## Patterns

The mold of each piece (entity, value object, port, use case, schema, route, controller, repository, factory, bootstrap adapter, error code, migration) is in the `be-slice-blueprint` skill. In short: a value object is immutable, with a private constructor and `static create()`; an entity is rich, with `create()` for a new one, `with()` for one read from persistence, and `toPersistence()` and `toOutput()`; every repository sits behind a port; each feature exposes `make<Feature>Module(deps)`; a domain error carries an `ErrorCode`, and the `ErrorMiddleware` maps the error class to the HTTP status.

- No `any` and no `console` in production code; tests may use `any`. [sensor: .eslintrc.json]
- A comment explains why, never what; a decision id appears only next to the rule written out in words, and no comment points at a section of the old CLAUDE.md. [sensor: .eslintrc.json]
- One runtime export per file, with its types next to it, checked in review. [no sensor]

## Routes

Every route path sits under `/api` and starts with its controller in the singular; the HTTP verb names the operation, and the path falls in one of five drawers. Filters go in the query and identity in the path. The `@swagger` block for each verb is in the `be-http-contract` skill.

| Drawer                  | Path                                                               | Verbs                           | Returns                                                                       |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------- | ----------------------------------------------------------------------------- |
| Collection              | `{controller}`                                                     | GET lists, POST creates         | GET: a page or an array, empty when there is nothing; POST: 201 with the item |
| Item                    | `{controller}/{key}`                                               | GET, PUT, PATCH, DELETE         | one element; 404 when it does not exist                                       |
| Slice of the collection | `{controller}/{slice}` or `{controller}/{slice}/{value}`           | GET; POST only on `installment` | a list already filtered by a business rule                                    |
| Action on the item      | `{controller}/{key}/{action}`                                      | PATCH                           | the item after the action                                                     |
| Box inside the item     | `{controller}/{key}/{sub}` or `{controller}/{key}/{sub}/{sub_key}` | GET, POST, PUT, DELETE          | a list or an item of the inner box                                            |

- A path falls in one drawer with a verb that drawer takes (the action and the inner box share a shape, and the verb tells them apart), and no segment is an operation word: `list`, `create`, `edit`, `update`, `delete`, or one starting with `list-`, `create-` or `get-`. [sensor: src/shared/http/route-convention.spec.ts]
- Literal segments are in kebab-case; a path param comes right after what it identifies, and path and query param names are in snake_case: the `{key}` is the id named after its controller (`wallet_id`, `payment_method_id`) or the `description_enum` of a catalog, and a bare `id` never appears. [sensor: src/shared/http/route-convention.spec.ts]
- The controller translates on capture, `id: String(req.params.wallet_id)`, and the use case, the entity and the repository keep their internal names. [sensor: src/shared/http/route-convention.spec.ts]
- A slice with a required dimension is named `-by-<dimension>`, and the dimension goes in the query with `required: true` in the contract. [sensor: src/shared/http/route-convention.spec.ts]
- In `<feature>.routes.ts`, a route with a literal segment is registered before the route with a param in the same position and the same verb, because the path id is not validated as a uuid. [sensor: src/shared/http/route-convention.spec.ts]
- Only `auth`, `person/me` and `health` stay outside the drawers, in a closed list of 11 routes: `POST auth/account`, `POST auth/session`, `PUT auth/session`, `DELETE auth/session`, `POST auth/password-recovery`, `GET person/me`, `PATCH person/me`, `DELETE person/me`, `PUT person/me/avatar`, `DELETE person/me/avatar` and `GET health`. [sensor: src/shared/http/route-convention.spec.ts]
- Every `*.route.ts` has an `@swagger` block and is registered in its `<feature>.routes.ts`. [sensor: src/shared/http/route-convention.spec.ts]
- A route whose handler reads `req.body` validates it in the controller with `assertValid`, `assertAuthInputValid` or `runValidate` and a `*Schema` class. [sensor: src/shared/http/route-convention.spec.ts]
- The OpenAPI spec built from the `@swagger` blocks has no YAML error, and its operations equal the route classes, verb and path. [sensor: scripts/build-openapi.cjs]

## Tests

Jest with ts-jest; each `*.spec.ts` sits next to the file it tests. The unit run (`jest-unit-config.ts`) measures coverage on domain and application code and on `infra/persistence/`; the rest of `infra/`, factories, `src/bootstrap/` and `src/shared/http/` are outside the measure, not outside testing. Repository specs run against the Firestore emulator in a container (`yarn emulator:start`, at `127.0.0.1:8085`), never against a hand-written fake. `test/e2e/*.e2e-live.spec.ts` write to the staging project and are not part of the unit run. How each piece is tested, and which assertion fails first, is in the `be-tests` skill.

- Unit coverage stays at 85% or more in `src/features/` and 90% or more in `src/shared/kernel/`, and each `src/features/**/infra/persistence/` folder stays at 95% or more in lines, statements and functions and 90% or more in branches. [sensor: jest-unit-config.ts]
- Test titles (`describe`, `it`) are in English with ASCII characters only (an error; a warning in the maintainer's `test/e2e/*.e2e-live.spec.ts`), and every `it` has an `expect` (still a warning). [sensor: .eslintrc.json]

## Commands

```text
yarn lint                        ESLint: layer boundaries, code quality, test titles
yarn arch:check                  dependency-cruiser over src/ (exit code = number of errors)
npx tsc --noEmit                 type check
yarn test:ci:unit                unit tests with the coverage gate
yarn build                       tsup build into dist/
node scripts/build-openapi.cjs   OpenAPI build from the @swagger blocks, compared with the route classes
```

The pre-commit (lefthook) runs `arch:check`, ESLint on the staged files and `tsc --noEmit` when a `src/**/*.ts` file is staged, and the route convention test when a route or a controller is staged. CI runs on every pull request to `dev` and `main`: lint, unit tests with coverage, `tsc --noEmit`, build, `arch:check` and the OpenAPI build.

- Types compile: `npx tsc --noEmit` exits 0 in the pre-commit and in CI. [sensor: lefthook.yml .github/workflows/ci-cd.yml]
- The build (`yarn build`) is green in CI. [sensor: .github/workflows/ci-cd.yml]
- dependency-cruiser is pinned at 17.4.3 in `devDependencies`, with its config in `.dependency-cruiser.cjs` at the repository root. [sensor: arch:check package.json]

## Language

Code identifiers, test titles, commit messages and this file are in English. Messages shown to the user (the error catalog and the validation messages) are in Brazilian Portuguese.

## Skills

Before writing a piece, read the SKILL.md of the skill that covers it; each SKILL.md points to the one template to read.

| Skill                | Use it to                                                                    | Path                                         |
| -------------------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| `be-slice-blueprint` | stamp or review any piece of a slice                                         | `.claude/skills/be-slice-blueprint/SKILL.md` |
| `be-http-contract`   | write a route, its `@swagger` block, its status codes and the error envelope | `.claude/skills/be-http-contract/SKILL.md`   |
| `be-tests`           | write, review or fix a `*.spec.ts`                                           | `.claude/skills/be-tests/SKILL.md`           |
| `be-arch-guard`      | run the gates and read a failure                                             | `.claude/skills/be-arch-guard/SKILL.md`      |
