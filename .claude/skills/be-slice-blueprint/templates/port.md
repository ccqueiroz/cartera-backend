# Ports

Interfaces only, in `domain/ports/`. Two kinds.

## Repository port — `<feature>.repository.port.ts`

```ts
import { Budget } from '@/features/budget/domain/budget.entity';

export interface BudgetRepository {
  findActiveById(id: string, userId: string): Promise<Budget | null>;
  // Includes soft-deleted: the use case tells 404 (missing) from 409 (removed).
  findById(id: string, userId: string): Promise<Budget | null>;
  listActiveByUser(userId: string): Promise<Budget[]>;
  create(budget: Budget): Promise<void>;
  update(budget: Budget): Promise<void>;
}
```

Rules: `userId` on every per-user finder (tenant isolation = same 404 as a missing id) · returns entities, never `doc.data()` · no `AtomicContext`/Firestore types in the port (a unit-of-work port with an opaque context is the planned fix; until it lands, follow the existing `*Tx` variants only in core-finance and wallet) · catalog repositories (category, payment-method) have no `userId`.

## Cross-feature port — `<owner>.gateway.port.ts` in the consumer

```ts
export interface ResolvedCategory {
  descriptionEnum: string;
  group: string;
}

export interface CategoryGateway {
  resolve(descriptionEnum: string): Promise<ResolvedCategory | null>;
}
```

Rules: raw shapes (strings, numbers, booleans), never the owner's entity or enum · only what this consumer needs · the adapter lives in `src/bootstrap/` (template bootstrap-adapter) and delegates to the owner's `internal` use cases · the owner's factory exposes `internal` for it.
