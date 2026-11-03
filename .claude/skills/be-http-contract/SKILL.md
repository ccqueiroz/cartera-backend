---
name: be-http-contract
description: >
  HTTP contract of the cartera-backend: route URL classes (AGENTS.md, Routes), HTTP verb
  map, status by error class, the {message, code} error envelope, the @swagger block
  per verb, $ref enums in shared/http/swagger/schemas.swagger.ts, and how the spec is
  built and checked (swagger-jsdoc glob, route-convention test, spec build script).
  Use when writing or reviewing a route, a @swagger block, a response shape, a status
  code, an error code at the border, or when the frontend contract / OpenAPI spec is
  the subject. PT: "rota/contrato/swagger/status/erro HTTP", "o que a rota devolve",
  "documenta a rota", "contrato com o front", "drift do swagger". EN: "route/contract/
  swagger/openapi/status/error envelope", "what does the route return".
---

# be-http-contract

The contract is the `@swagger` block on each `*.route.ts` plus the class-validator schema
plus the controller status. `swagger-jsdoc` reads the blocks at boot (`swagger-definition.ts`
globs) and serves `/api-docs`. Read `templates/swagger-blocks.md` for the exact block per verb.

## URL and verb (AGENTS.md, Routes, unchanged)

`{controller-singular}/{slug}[/{param}][?filters]` · `list-all` GET · `list-by-id/{id}` GET ·
`list-by-<dim>/{value}` GET · `create`, `create-<variant>` POST · `edit/{key}` PUT ·
`delete/{key}` DELETE · `<verb>/{id}` PATCH (state action) · identity in path, filter in
query · `{key}` is `descriptionEnum` for catalogs, uuid elsewhere · exceptions only
`person/me[/{sub}]` and `credit-card/invoice/...`.

## Status and envelope

| Outcome                    | Status                      | Comes from      |
| -------------------------- | --------------------------- | --------------- |
| created                    | 201                         | controller      |
| read / edit / action       | 200                         | controller      |
| accepted (e-mail sent)     | 202                         | controller      |
| deleted / signout          | 204                         | controller      |
| ValidationError            | 400                         | ErrorMiddleware |
| UnauthorizedError          | 401                         | ErrorMiddleware |
| ForbiddenError             | 403                         | ErrorMiddleware |
| EntityNotFoundError        | 404                         | ErrorMiddleware |
| DuplicateEntityError       | 409                         | ErrorMiddleware |
| PayloadTooLargeError       | 413                         | ErrorMiddleware |
| BusinessRuleViolationError | 422                         | ErrorMiddleware |
| anything else              | 500 `INTERNAL_SERVER_ERROR` | ErrorMiddleware |

Success body is `{ data: <Output> }`; a paginated list is `{ data: { content, page, size, totalElements, totalPages, ordering } }`; a list without pagination is `{ data: [...] }`; 204 has no body; the error body is `{ message, code }`.

## Block rules (rule 5 and the operation count are checked by `node scripts/build-openapi.cjs`; the others in review)

1. Path in OpenAPI form `{id}`, never `:id`; verb equals `method`; `tags: [<Feature>]`.
2. `security: [sessionCookieAuth]` on every guarded route; none on auth/health.
3. `requestBody` mirrors the schema field by field; `required` = fields without `@IsOptional()`;
   enums through `$ref: '#/components/schemas/<Enum>'`.
4. Responses list every status the route flow produces, the 500 included, each as `$ref: '#/components/responses/<Name>'`;
   each error response carries `ErrorResponse` and a `code` `enum` with only the codes of that route and that status;
   400 whenever there is a body or validated param; 401 whenever there is `security`.
5. No `:` or `,` in an unquoted flow-map description: quote it (`{ description: "..." }`) or use block form.
   A `:` breaks the YAML and drops the whole operation; a `,` cuts the description. No `{ description: OK. }`;
   every 200, 201 and 202 declares the `data` schema.

## How to check

- `npx jest src/shared/http/route-convention.spec.ts` — every route has `@swagger`, is in
  `<feature>.routes.ts`, and the controller validates body routes.
- `node scripts/build-openapi.cjs` builds the spec exactly like boot does and writes
  `src/shared/http/swagger/openapi.json`; it exits 1 on a YAML error, an ignored block or an
  operation count different from the route classes.
- A new `ErrorCode` at the border appears in the `responses` of every route that can throw it.
