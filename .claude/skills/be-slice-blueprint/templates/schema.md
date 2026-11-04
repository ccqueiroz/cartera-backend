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
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const CIVIL_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateBudgetSchema {
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O nome',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_MASCULINE]({
      attribute: 'O nome do orçamento',
    }),
  })
  name!: string;

  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'O limite',
      }),
    },
  )
  @Min(0.01, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_GREATER_THAN_ZERO]({
      attribute: 'O limite',
    }),
  })
  limit!: number;

  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A categoria',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_FEMININE]({
      attribute: 'A categoria',
    }),
  })
  categoryDescriptionEnum!: string;

  @IsOptional()
  @Matches(CIVIL_DATE, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DATE]({
      attribute: 'A data',
    }),
  })
  startsAt?: string;
}
```

Rules: enum fields use `@IsIn(Object.values(<Enum>))` from the feature's own enum (a foreign enum is copied as a closed list, like `payment-method-enums.ts`, to keep the boundary) · dates by the same regex, numbers never as strings · path params get their own tiny schema (`description-enum-param.schema.ts`) · no `@Transform` tricks: the controller reads `req.body` as is · unknown fields are rejected by default (`REJECT_UNKNOWN`); drop (`DROP_UNKNOWN`) only where the feature spec says so (person, payment-method edit).
