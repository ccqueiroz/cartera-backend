# @swagger blocks per verb

Replace `budget`/`Budget` by the feature. Paths use `{param}`; verbs match `method`; every guarded
route has `security`; every status is a `$ref` to `components.responses`, except the 204.

Shared components live in `src/shared/http/swagger/contract.swagger.ts`: responses `Unauthorized`,
`UserDisabled`, `InternalServerError`, `ValidationFailed`, `WalletNotFound`; parameters `Page`, `Size`,
`DirectionOrder`, `SortValue`, `SearchByDateValue`; schemas `ErrorResponse`, `PageMeta`. What only one
feature uses lives in `src/features/<feature>/infra/http/<feature>.swagger.ts` (see the last section).

## GET list (paginated)

```ts
/**
 * @swagger
 * /api/budget/list-all:
 *   get:
 *     summary: Lista os orçamentos ativos do usuário autenticado, paginados.
 *     tags: [Budget]
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Size'
 *       - in: query
 *         name: ordering
 *         schema: { type: string, enum: [createdAt, limit] }
 *       - $ref: '#/components/parameters/DirectionOrder'
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [categoryDescriptionEnum] }
 *       - $ref: '#/components/parameters/SortValue'
 *       - in: query
 *         name: search_by_date
 *         schema: { type: string, enum: [createdAt] }
 *       - $ref: '#/components/parameters/SearchByDateValue'
 *     responses:
 *       200: { $ref: '#/components/responses/BudgetPage' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

## GET by id

```ts
/**
 * @swagger
 * /api/budget/list-by-id/{id}:
 *   get:
 *     summary: Obtém um orçamento ativo do usuário autenticado.
 *     tags: [Budget]
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { $ref: '#/components/responses/BudgetItem' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/BudgetNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

## POST (create)

```ts
/**
 * @swagger
 * /api/budget/create:
 *   post:
 *     summary: Cria um orçamento do usuário autenticado.
 *     tags: [Budget]
 *     security:
 *       - sessionCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, limit, categoryDescriptionEnum]
 *             properties:
 *               name: { type: string }
 *               limit: { type: number, example: 2500 }
 *               categoryDescriptionEnum:
 *                 $ref: '#/components/schemas/CategoryDescriptionEnum'
 *     responses:
 *       201: { $ref: '#/components/responses/BudgetCreated' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/CategoryNotFound' }
 *       409: { $ref: '#/components/responses/BudgetAlreadyExists' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

## PUT (edit) — PATCH (state action) is the same block with `patch:` and 422 when the entity can refuse

```ts
/**
 * @swagger
 * /api/budget/edit/{id}:
 *   put:
 *     summary: Edita nome e limite de um orçamento ativo.
 *     tags: [Budget]
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               limit: { type: number }
 *     responses:
 *       200: { $ref: '#/components/responses/BudgetItem' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/BudgetNotFound' }
 *       409: { $ref: '#/components/responses/BudgetDeleted' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

## DELETE

```ts
/**
 * @swagger
 * /api/budget/delete/{id}:
 *   delete:
 *     summary: Remove (soft-delete) um orçamento do usuário autenticado.
 *     tags: [Budget]
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Orçamento removido. }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/BudgetNotFound' }
 *       422: { $ref: '#/components/responses/BudgetDeleted' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

## `<feature>.swagger.ts`

One `@swagger components:` block followed by `export {};`. An error response carries the codes of
that route and that status, no more and no fewer; a success response wraps the Output in `data`
(a paginated list uses `PageMeta` plus `content`).

```ts
/**
 * @swagger
 * components:
 *   schemas:
 *     BudgetOutput:
 *       type: object
 *       required: [id, name, limit]
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         limit: { type: number }
 *   responses:
 *     BudgetNotFound:
 *       description: Orçamento inexistente, removido ou de outro usuário.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - BUDGET_NOT_FOUND
 *     BudgetItem:
 *       description: Orçamento.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/BudgetOutput'
 *     BudgetPage:
 *       description: Página de orçamentos.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data:
 *                 allOf:
 *                   - $ref: '#/components/schemas/PageMeta'
 *                   - properties:
 *                       content:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/BudgetOutput'
 */
export {};
```

## Build and diff

Run `node scripts/build-openapi.cjs`: it builds the spec with the same definition and globs as
`src/shared/http/swagger/swagger-definition.ts`, writes `src/shared/http/swagger/openapi.json`, and
exits 1 on a `YAMLSyntaxError` (an operation silently dropped from `/api-docs`), an ignored block or
an operation count different from the route classes.

Shared `$ref` enums live in `src/shared/http/swagger/schemas.swagger.ts` (`CategoryDescriptionEnum`,
`CategoryGroupEnum`, `PaymentMethodDescriptionEnum`, `PaymentStatusDescriptionEnum`); the T2 script
generates the file, so never edit it by hand.
