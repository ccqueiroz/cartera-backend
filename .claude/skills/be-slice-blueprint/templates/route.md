# Route and routes registry

## `infra/http/<verb>-<feature>.route.ts`

One class per route, `implements Route`, `method`/`path`/`handler` + `middlewares` by constructor; the `@swagger` block sits on the class. Path follows the five drawers of AGENTS.md, Routes (`budget`, `budget/:budget_id`, `budget/<slice>`, `budget/:budget_id/<action>`, `budget/:budget_id/<sub>`): the verb names the operation, and the param is in snake_case, `:budget_id` in `path` and `{budget_id}` in the `@swagger` block. The full per-verb swagger blocks are in the `be-http-contract` skill.

```ts
import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BudgetController } from '@/features/budget/infra/http/budget.controller';

/**
 * @swagger
 * /api/budget:
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
 *               startsAt: { type: string, example: '2026-10-01' }
 *     responses:
 *       201: { description: Orçamento criado. }
 *       400: { description: Payload inválido (VALIDATION_FAILED). }
 *       401: { description: "Sessão ausente ou inválida (INVALID_TOKEN, TOKEN_EXPIRED)." }
 *       404: { description: Categoria não encontrada (CATEGORY_NOT_FOUND). }
 *       409: { description: Já existe orçamento com esse nome (BUDGET_ALREADY_EXISTS). }
 */
export class CreateBudgetRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'budget';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BudgetController,
    public readonly middlewares: Middleware[],
  ) {
    this.handler = controller.create;
  }

  public static create(
    controller: BudgetController,
    middlewares: Middleware[],
  ): CreateBudgetRoute {
    return new CreateBudgetRoute(controller, middlewares);
  }
}
```

## `infra/http/<feature>.routes.ts`

```ts
export function budgetRoutes(
  controller: BudgetController,
  authMiddleware: Middleware,
): Route[] {
  const authenticated = [authMiddleware];
  return [
    ListBudgetsRoute.create(controller, authenticated),
    GetBudgetByIdRoute.create(controller, authenticated),
    CreateBudgetRoute.create(controller, authenticated),
    EditBudgetRoute.create(controller, authenticated),
    DeleteBudgetRoute.create(controller, authenticated),
  ];
}
```

Rules: every `*.route.ts` is listed here (the route-convention test checks the module name) · guard per route, never global · bodyLimit only on the route that needs it (`replace-avatar.route.ts`) · HTTP verb map: GET read, POST create/new fact, PUT edit, PATCH state action, DELETE soft-delete.
