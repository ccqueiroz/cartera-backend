# Error code

Two kernel files change together, in the feature's block, same order: `src/shared/kernel/errors/error-code.ts` (enum) and `error-catalog.ts` (PT-BR message, `params` only when the text uses them). The HTTP status is the class you throw, not the code:

| Class (kernel `domain.error.ts`) | Status | Use for                                         |
| -------------------------------- | ------ | ----------------------------------------------- |
| `ValidationError`                | 400    | shape/format wrong, invalid enum value          |
| `UnauthorizedError`              | 401    | token missing/invalid/expired                   |
| `ForbiddenError`                 | 403    | account disabled/deleted                        |
| `EntityNotFoundError`            | 404    | missing, soft-deleted, or another user's id     |
| `DuplicateEntityError`           | 409    | already exists; already removed (`<X>_DELETED`) |
| `PayloadTooLargeError`           | 413    | avatar over the limit                           |
| `BusinessRuleViolationError`     | 422    | rule refused the action                         |

```ts
// error-code.ts
BUDGET_NOT_FOUND = 'BUDGET_NOT_FOUND',
BUDGET_ALREADY_EXISTS = 'BUDGET_ALREADY_EXISTS',
BUDGET_NAME_REQUIRED = 'BUDGET_NAME_REQUIRED',
BUDGET_LIMIT_REQUIRED = 'BUDGET_LIMIT_REQUIRED',
BUDGET_DELETED = 'BUDGET_DELETED',

// error-catalog.ts
[ErrorCode.BUDGET_NOT_FOUND]: () => 'Orçamento não encontrado.',
[ErrorCode.BUDGET_ALREADY_EXISTS]: (params) =>
  params?.name ? `Já existe um orçamento chamado "${params.name}".` : 'Orçamento já existe.',
[ErrorCode.BUDGET_NAME_REQUIRED]: () => 'O nome do orçamento é obrigatório.',
[ErrorCode.BUDGET_LIMIT_REQUIRED]: () => 'O limite do orçamento deve ser maior que zero.',
[ErrorCode.BUDGET_DELETED]: () => 'Este orçamento foi removido e não pode mais ser operado.',

// throwing (domain or application)
throw new EntityNotFoundError(ErrorCode.BUDGET_NOT_FOUND);
throw new DuplicateEntityError(ErrorCode.BUDGET_ALREADY_EXISTS, { name });
```

The response is always `{ message, code }` (ErrorMiddleware). Never: a new status class, `ApiError`, status numbers in domain/application, `throw new Error('...')` on a business path (it becomes a 500). A feature subclass (`TransactionNotFoundError extends EntityNotFoundError`) is optional sugar that fixes the code; it adds a file, so prefer the plain class unless the code is thrown from five or more places.
