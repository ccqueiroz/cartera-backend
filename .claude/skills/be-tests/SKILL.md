---
name: be-tests
description: >
  How each layer of the cartera-backend is tested: red-first by assertion, what to test
  where (domain and application without IO, repositories by contract against the
  in-memory adapter and the Firestore fake, controllers with jest.fn use cases, routes
  registry, factory, bootstrap adapters, slice e2e via factory + fake db + real guard),
  the mocks in src/test/, describe/it naming in English, the unit coverage gate (85%
  features, 90% kernel) and what is outside it. Use when writing, reviewing or fixing a
  *.spec.ts, choosing a mock or fake, making a test fail first, or reading the coverage
  report. PT: "escreve/revisa/conserta o teste", "teste visto falhando", "mock ou fake",
  "cobertura", "spec do caso de uso/entidade/repositório/controller". EN: "write/review/
  fix a spec", "red first", "mock vs fake", "coverage", "contract test".
---

# be-tests

`*.spec.ts` sits next to the file it tests. Jest + ts-jest, `jest-unit-config.ts`
(`npx jest -c jest-unit-config.ts <path> --coverage=false` for one file). Titles in English,
present tense, behavior not implementation (`'rejects a zero limit'`, not `'calls repository'`).
`any` is allowed only in specs. Read ONLY the template you need.

## Routing table

| Piece                               | Template                                | Doubles                                                                                                                                     | Red first (the assertion that fails on the skeleton) |
| ----------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Entity / VO                         | `templates/entity-spec.md`              | none                                                                                                                                        | `toOutput().active` is undefined                     |
| Use case                            | `templates/usecase-spec.md`             | in-memory repository, gateway as object literal                                                                                             | result field undefined / promise does not reject     |
| Schema                              | `templates/schema-spec.md`              | `runValidate` with `REJECT_UNKNOWN`                                                                                                         | `errors.length` is 0 where an error is expected      |
| Repository (both adapters)          | `templates/repository-contract-spec.md` | the shared Firestore fake, planned; until it exists, the local fake of the sibling spec, as in `src/features/category/category.e2e.spec.ts` | `findById` returns null                              |
| Controller                          | `templates/controller-spec.md`          | use cases as `jest.fn`, minimal req/res                                                                                                     | `res.status` not called with 201                     |
| Routes registry / factory / adapter | `templates/wiring-spec.md`              | `jest.fn` middleware, internal use case as `jest.fn`                                                                                        | list of `VERB path` differs                          |
| Slice e2e (in process)              | `templates/slice-e2e-spec.md`           | fake db + real `VerifyTokenMiddleware` + real `ErrorMiddleware`                                                                             | `statusCode` is 0                                    |

## Rules

1. Test first, seen red by an assertion (`expect`), never by "not implemented": the skeleton
   returns inert values (`{}`, `[]`, `null`), so the first `expect` fails on content.
2. Domain and application never touch IO: in-memory repository of the feature (write it if
   missing), ports of other features as literals. `jest.fn()` per repository method tests the
   implementation and is forbidden for use cases (the 10 person specs are legacy, not a model).
3. Repositories are tested by contract: the same `describe.each` runs against the in-memory
   adapter and the Firestore adapter over the shared Firestore fake, planned; until it exists,
   over the local fake of the sibling spec, as in `src/features/category/category.e2e.spec.ts`;
   never a hand-written `makeDb` per spec.
4. Infra (routes, controller, factory, adapters, shared/http) is outside the unit coverage gate
   but not outside testing: one spec each, small.
5. Every `it` has at least one `expect`; `it.each` for tables (status map, catalog codes).
6. Error assertions check the code: `rejects.toMatchObject({ code: ErrorCode.X })` or
   `toThrow(expect.objectContaining({ code }))`; status is asserted only at the controller/e2e level.
7. The gate (`yarn test:ci:unit`): 85% in `src/features/`, 90% in `src/shared/kernel/`;
   `infra/**`, `*.factory.ts`, `bootstrap/**`, `shared/http/**` are excluded from the measure.
8. e2e-live (`test/e2e`, staging) is run only by the maintainer; never by an agent.
