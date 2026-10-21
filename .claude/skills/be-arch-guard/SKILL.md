---
name: be-arch-guard
description: >
  Validates the cartera-backend layer boundaries and runs the deterministic gates.
  Use when reviewing or creating backend code, before committing, or when asked to
  check architecture, dependencies, cycles, imports between features, express or
  firebase leaking into domain/application, packages importing the system, bootstrap
  adapters touching the database, route convention, or why the pre-commit fails.
  PT: "checa/valida a arquitetura do backend", "tem ciclo?", "import entre features",
  "vazou express/firestore no domínio?", "por que o pre-commit barrou", "roda os
  portões". EN: "check/validate backend architecture/boundaries/dependencies/cycles",
  "run the gates", "why did arch:check fail". Runs dependency-cruiser + ESLint +
  route-convention and interprets the violations.
---

# be-arch-guard

Enforcement lives in versioned config: `.dependency-cruiser.cjs` at the repo root,
`.eslintrc.json`, `src/shared/http/route-convention.spec.ts`, run by lefthook on commit and by
CI. This skill runs them and explains failures; it never edits the rules.

## The wall (what each sensor checks)

Severity `error` blocks the commit; `warn` reports a known violation that a later change clears.

| Rule (dependency-cruiser)           | Severity | What it forbids                                                                |
| ----------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `no-circular`                       | error    | circular imports                                                               |
| `feature-to-feature`                | error    | a feature importing another feature                                            |
| `kernel-pure`                       | error    | `shared/kernel` importing anything outside itself                              |
| `domain-no-http-no-infra`           | error    | domain importing `shared/http`, `infra` or `bootstrap`                         |
| `application-no-http-no-infra`      | error    | application importing `shared/http`, `infra` or `bootstrap`                    |
| `engine-only-inside-core-finance`   | error    | `transaction-engine` consumed outside core-finance (bootstrap wires it)        |
| `http-no-engine`                    | error    | an `infra/http` file importing the `transaction-engine`                        |
| `shared-no-features`                | error    | `shared` importing `features`                                                  |
| `business-layer-no-npm`             | warn     | domain or application importing an npm package                                 |
| `business-layer-no-packages`        | warn     | domain or application importing `src/packages`                                 |
| `business-layer-no-shared-database` | warn     | domain or application importing `shared/database`                              |
| `packages-no-system`                | warn     | `src/packages` importing features, shared or bootstrap                         |
| `bootstrap-adapter-no-db-npm`       | warn     | a bootstrap gateway adapter importing `firebase-admin`                         |
| `bootstrap-adapter-no-db-path`      | warn     | a bootstrap gateway adapter importing the firebase client or `shared/database` |
| `no-orphans`                        | warn     | a module nothing imports                                                       |

Other sensors:

| Rule                                                                                                                                  | Sensor                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `domain`/`application` import no npm package, no `@/packages`, no `shared/database`                                                   | ESLint `no-restricted-imports`                              |
| `shared/http` never imports features; `*.route.ts` only under `features/*/infra/http`                                                 | ESLint `import/no-restricted-paths`, `no-restricted-syntax` |
| every `*.route.ts` has `@swagger`, is listed in `<feature>.routes.ts`, and body routes validate in the controller (AGENTS.md, Routes) | `route-convention.spec.ts`                                  |
| no `any`, no `console` in production                                                                                                  | ESLint overrides                                            |
| types compile                                                                                                                         | `tsc --noEmit`                                              |
| the OpenAPI document still builds                                                                                                     | `node scripts/build-openapi.cjs`                            |

## How to check

```bash
yarn arch:check                                   # dependency-cruiser over src/**/*.ts
yarn lint                                         # ESLint boundaries + quality
npx tsc --noEmit
npx jest src/shared/http/route-convention.spec.ts --coverage=false
node scripts/build-openapi.cjs                    # OpenAPI document builds
```

The pre-commit (lefthook) runs `arch-guard` (`arch:check`), `typecheck` (`tsc --noEmit`) and
`eslint-boundaries` (ESLint on the staged files) when a `src/**/*.ts` file is staged, and
`route-convention` when a route or a controller directly in `infra/http/` is staged. Do not
bypass it (`--no-verify` is a finding for the judge). The known ACL violations show as warnings
in `yarn arch:check` until the change that clears them; a new violation is never added.

## Interpreting

- `feature-to-feature` → declare a port in the consumer, adapter in `src/bootstrap/` (be-slice-blueprint → port, bootstrap-adapter).
- `business-layer-no-shared-database` → the use case took `AtomicRunner`/`AtomicContext`; until the unit-of-work port lands, keep the pattern of the sibling use cases and say so in the PR.
- `packages-no-system` → the client wrapper imported the kernel; move the translation to `shared/`.
- `kernel-pure` → a VO imported a feature or a lib; the kernel is a leaf.
- route-convention failure → missing `@swagger`, route file not in `<feature>.routes.ts`, or body route without `assertValid` in the controller.
- `0 modules cruised` → dependency-cruiser could not load `typescript`; run from the repo root with the devDependency installed, not from an npx cache.
