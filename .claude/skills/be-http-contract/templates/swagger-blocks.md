# @swagger blocks per verb

Replace `budget`/`Budget` by the feature. Paths use `{param}`; verbs match `method`; every guarded
route has `security`; every response names the `ErrorCode`.

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
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 0, default: 0 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, minimum: 1, default: 20 }
 *     responses:
 *       200:
 *         description: Página de orçamentos ({ content, page, size, totalElements }).
 *       401: { description: "Sessão ausente ou inválida (INVALID_TOKEN, TOKEN_EXPIRED)." }
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
 *       200: { description: Orçamento encontrado. }
 *       401: { description: "Sessão ausente ou inválida (INVALID_TOKEN, TOKEN_EXPIRED)." }
 *       404: { description: "Orçamento inexistente, removido ou de outro usuário (BUDGET_NOT_FOUND)." }
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
 *       201: { description: Orçamento criado. }
 *       400: { description: Payload inválido (VALIDATION_FAILED). }
 *       401: { description: "Sessão ausente ou inválida (INVALID_TOKEN, TOKEN_EXPIRED)." }
 *       404: { description: Categoria não encontrada (CATEGORY_NOT_FOUND). }
 *       409: { description: Já existe orçamento com esse nome (BUDGET_ALREADY_EXISTS). }
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
 *       200: { description: Orçamento atualizado. }
 *       400: { description: Payload inválido (VALIDATION_FAILED). }
 *       401: { description: "Sessão ausente ou inválida (INVALID_TOKEN, TOKEN_EXPIRED)." }
 *       404: { description: Orçamento não encontrado (BUDGET_NOT_FOUND). }
 *       409: { description: Orçamento removido (BUDGET_DELETED). }
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
 *       401: { description: "Sessão ausente ou inválida (INVALID_TOKEN, TOKEN_EXPIRED)." }
 *       404: { description: Orçamento não encontrado (BUDGET_NOT_FOUND). }
 *       422: { description: Orçamento já removido (BUDGET_DELETED). }
 */
```

## Build and diff

Run `node scripts/build-openapi.cjs`: it builds the spec with the same definition and globs as
`src/shared/http/swagger/swagger-definition.ts`, writes no file, and exits 1 on a `YAMLSyntaxError`
(an operation silently dropped from `/api-docs`), an ignored block or an operation count different
from the route classes.

Shared `$ref` enums live in `src/shared/http/swagger/schemas.swagger.ts` (`CategoryDescriptionEnum`,
`CategoryGroupEnum`, `PaymentMethodDescriptionEnum`, `PaymentStatusDescriptionEnum`); keep them equal
to the TypeScript enums (they drift today: `NINY_NINE`, `AIRPLANE` only in the swagger copy).
