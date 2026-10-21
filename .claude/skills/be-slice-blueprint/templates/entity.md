# Entity

`domain/<feature>.entity.ts`. Private constructor over a `props` object; `create()` for a new one (validates, stamps `updatedAt: null`, `deletedAt: null`); `with()` to rehydrate from persistence (never validates); invariants in `validateProps`; behavior methods mutate `props` and stamp `updatedAt`; `toPersistence()` is the stored shape (pure values), `toOutput()` is the HTTP shape (derived fields computed here, never persisted).

```ts
import {
  BusinessRuleViolationError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { Money } from '@/shared/kernel/value-objects/money.vo';

interface BudgetProps {
  id: string;
  userId: string;
  name: string;
  limit: Money;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface BudgetPersistence {
  id: string;
  userId: string;
  name: string;
  limit: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}
export interface BudgetOutput {
  id: string;
  name: string;
  limit: number;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export class Budget {
  private constructor(private props: BudgetProps) {}

  public static create(input: {
    id: string;
    userId: string;
    name: string;
    limit: number;
    createdAt: string;
  }): Budget {
    const props: BudgetProps = {
      id: input.id,
      userId: input.userId,
      name: input.name.trim(),
      limit: Money.create(input.limit),
      createdAt: input.createdAt,
      updatedAt: null,
      deletedAt: null,
    };
    Budget.validateProps(props);
    return new Budget(props);
  }

  public static with(persistence: BudgetPersistence): Budget {
    return new Budget({
      ...persistence,
      limit: Money.create(persistence.limit),
    });
  }

  private static validateProps(props: BudgetProps): void {
    if (!props.name) throw new ValidationError(ErrorCode.BUDGET_NAME_REQUIRED);
    if (props.limit.isZero())
      throw new ValidationError(ErrorCode.BUDGET_LIMIT_REQUIRED);
  }

  public rename(name: string, updatedAt: string): void {
    const next: BudgetProps = { ...this.props, name: name.trim(), updatedAt };
    Budget.validateProps(next);
    this.props = next;
  }

  public softDelete(deletedAt: string): void {
    if (this.props.deletedAt !== null)
      throw new BusinessRuleViolationError(ErrorCode.BUDGET_DELETED);
    this.props.deletedAt = deletedAt;
    this.props.updatedAt = deletedAt;
  }

  public get id(): string {
    return this.props.id;
  }
  public get userId(): string {
    return this.props.userId;
  }
  public get isActive(): boolean {
    return this.props.deletedAt === null;
  }

  public toPersistence(): BudgetPersistence {
    return {
      id: this.props.id,
      userId: this.props.userId,
      name: this.props.name,
      limit: this.props.limit.value,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
    };
  }
  public toOutput(): BudgetOutput {
    return {
      id: this.props.id,
      name: this.props.name,
      limit: this.props.limit.value,
      active: this.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
```

Checklist: private ctor · `create` validates, `with` does not · `deletedAt` always present (`null`), never absent · money through `Money`, dates as strings · no HTTP, no Firestore, no `format()` · getters only for what use cases read · spec next to it (`be-tests` → entity-spec).
