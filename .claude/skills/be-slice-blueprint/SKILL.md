---
name: be-slice-blueprint
description: >
  Canonical mold for how each piece of a cartera-backend vertical slice is born —
  entity, value object, repository port, cross-feature gateway port, use case,
  class-validator schema, route with @swagger, <feature>.routes.ts registry,
  controller, Firestore repository, in-memory repository, factory, bootstrap
  gateway adapter, ErrorCode entry, seed migration. Use when creating, scaffolding,
  stamping, extending or reviewing a feature/slice, use case, entity, VO, port,
  route, controller, schema, repository, factory, adapter, error code or migration
  in the backend. PT: "cria/monta/estampa/revisa uma feature/fatia/caso de uso/
  entidade/VO/porta/rota/controller/schema/repositório/factory/adapter/erro/migração
  no backend", "nova feature do backend", "como nasce X no backend". EN: "create/build/
  scaffold/review a backend slice/use case/entity/value object/port/route/controller/
  schema/repository/factory/adapter/error code/migration". Loads a thin router; each
  template is read on demand from the routing table.
---

# be-slice-blueprint

Stamp each piece in the canonical shape before writing it; `be-arch-guard` checks the
boundaries afterwards and `be-tests` says how each piece is tested. **Read ONLY the
template you need** — never load all of them.

## Routing table

| Piece                | File (inside `src/features/<feature>/`)                       | Template                            | One-liner                                                                                            |
| -------------------- | ------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Entity               | `domain/<feature>.entity.ts`                                  | `templates/entity.md`               | private ctor, `create()`/`with()`, `validateProps`, behavior methods, `toPersistence()`/`toOutput()` |
| Value object         | `domain/<name>.vo.ts` (or `shared/kernel/value-objects/`)     | `templates/value-object.md`         | immutable, `create()` validates, no setters, arithmetic inside                                       |
| Repository port      | `domain/ports/<feature>.repository.port.ts`                   | `templates/port.md`                 | interface only; `userId` on every finder; no Firestore types                                         |
| Cross-feature port   | `domain/ports/<owner>.gateway.port.ts`                        | `templates/port.md`                 | raw shapes, never the other feature's entity                                                         |
| Use case             | `application/<verb>-<feature>.usecase.ts`                     | `templates/use-case.md`             | private ctor + `static create`, `execute(input)`, ports + `generateId`/`now`, returns Output         |
| Schema               | `infra/http/schemas/<verb>-<feature>.schema.ts`               | `templates/schema.md`               | class-validator, PT-BR messages, shape only                                                          |
| Route                | `infra/http/<verb>-<feature>.route.ts`                        | `templates/route.md`                | `implements Route`, `@swagger` block, handler from controller                                        |
| Routes registry      | `infra/http/<feature>.routes.ts`                              | `templates/route.md`                | every route, guard per route                                                                         |
| Controller           | `infra/http/<feature>.controller.ts`                          | `templates/controller.md`           | arrow methods, `assertValid` → use case → status + json; never catches                               |
| Firestore repository | `infra/persistence/<feature>.repository.firestore.ts`         | `templates/repository-firestore.md` | owns the collection name, `with()`/`toPersistence()`, `deletedAt == null`                            |
| In-memory repository | `infra/persistence/in-memory-<feature>.repository.ts`         | `templates/repository-firestore.md` | reference implementation of the port, used by use case specs                                         |
| Factory              | `<feature>.factory.ts`                                        | `templates/factory.md`              | `make<Feature>Module(deps)` → `{ routes, internal }`                                                 |
| Bootstrap adapter    | `src/bootstrap/<consumer>-<owner>.gateway.adapter.ts`         | `templates/bootstrap-adapter.md`    | implements the consumer port by delegating to the owner's `internal`; no db                          |
| Error code           | `src/shared/kernel/errors/error-code.ts` + `error-catalog.ts` | `templates/error-code.md`           | enum line + PT-BR message; status comes from the class thrown                                        |
| Seed migration       | `migrations-firebase/NNN-<verb>-<thing>.ts`                   | `templates/migration.md`            | new file per addition, idempotent, ISO instants                                                      |

## Order to stamp a new slice

error codes → entity (+ VOs) → ports → use cases → schemas → controller → routes +
`<feature>.routes.ts` → Firestore + in-memory repositories → factory → `main.ts` wiring
(support before consumer) → bootstrap adapter if another feature consumes it. Each piece
is born with its `*.spec.ts` (see `be-tests`), test first, red by assertion.

## Hard rules (the sensor that checks each one is in AGENTS.md)

1. Feature never imports another feature: port in the consumer + adapter in `src/bootstrap/`.
2. `domain` and `application` import only `@/shared/kernel`, their own feature and `@/shared/query`; no express, no firebase, no `@/packages`, no `@/shared/database`.
3. Only the owner feature's `infra/persistence` reads or writes its collections.
4. Data purity: money as `number` via `Money`, civil dates `YYYY-MM-DD`, instants `toISOString()`, documents digits-only, rates as decimal fraction up to 8 places; the backend never formats.
5. Errors: `ErrorCode` + kernel class; the HTTP status is the class, the message is the catalog; never `ApiError`/status in domain.
6. 1 file = 1 runtime export (types alongside are fine); imports by `@/` alias, never relative across folders.
7. Comments explain why (a rule, a trade-off, a Firestore constraint), never what; no decision ids without the rule in plain words.
