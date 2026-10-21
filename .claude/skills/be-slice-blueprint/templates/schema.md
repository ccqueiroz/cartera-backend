# Schema (trust boundary)

`infra/http/schemas/<verb>-<feature>.schema.ts`. One class per route with a body, query or param to validate; class-validator decorators with PT-BR messages (they become `details` of `VALIDATION_FAILED`); shape and type only, the business invariant stays in the entity (no triple validation: schema, use case and entity do not each repeat the same rule). Import decorators from `class-validator` directly (the schema is a connector, so it may name the library).

```ts
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

const CIVIL_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateBudgetSchema {
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do orçamento é obrigatório.' })
  name!: string;

  @IsNumber({}, { message: 'O limite deve ser um número.' })
  @Min(0.01, { message: 'O limite deve ser maior que zero.' })
  limit!: number;

  @IsString({ message: 'A categoria deve ser um texto.' })
  @IsNotEmpty({ message: 'A categoria é obrigatória.' })
  categoryDescriptionEnum!: string;

  @IsOptional()
  @Matches(CIVIL_DATE, { message: 'A data deve estar no formato YYYY-MM-DD.' })
  startsAt?: string;
}
```

Rules: enum fields use `@IsIn(Object.values(<Enum>))` from the feature's own enum (a foreign enum is copied as a closed list, like `payment-method-enums.ts`, to keep the boundary) · dates by the same regex, numbers never as strings · path params get their own tiny schema (`description-enum-param.schema.ts`) · no `@Transform` tricks: the controller reads `req.body` as is · unknown fields are rejected by default (`REJECT_UNKNOWN`); drop (`DROP_UNKNOWN`) only where the feature spec says so (person, payment-method edit).
