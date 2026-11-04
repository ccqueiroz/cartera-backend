import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  Type,
  ValidateNested,
} from '@/packages/clients/class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

class UpdatePersonPhoneSchema {
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O número do telefone',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_MASCULINE]({
      attribute: 'O número do telefone',
    }),
  })
  number!: string;

  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O código do país',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_MASCULINE]({
      attribute: 'O código do país',
    }),
  })
  countryCode!: string;

  @IsBoolean({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_A_BOOLEAN]({
      attribute: 'isWhatsapp',
    }),
  })
  isWhatsapp!: boolean;
}

class UpdatePersonDocumentSchema {
  @IsIn(['CPF', 'CNPJ'], {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_CPF_OR_CNPJ]({
      attribute: 'O tipo do documento',
    }),
  })
  type!: string;

  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O valor do documento',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_MASCULINE]({
      attribute: 'O valor do documento',
    }),
  })
  value!: string;
}

class UpdatePersonMonthlyIncomeSchema {
  @IsOptional()
  @IsNumber(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]({
        attribute: 'A renda mensal',
      }),
    },
  )
  @Min(0, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_NOT_BE_NEGATIVE_FEMININE]({
      attribute: 'A renda mensal',
    }),
  })
  value?: number | null;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A moeda da renda mensal',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_NOT_BE_EMPTY_FEMININE]({
      attribute: 'A moeda da renda mensal',
    }),
  })
  currency?: string | null;
}

export class UpdatePersonSchema {
  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O primeiro nome',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_NOT_BE_EMPTY_MASCULINE]({
      attribute: 'O primeiro nome',
    }),
  })
  firstName?: string;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O sobrenome',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_NOT_BE_EMPTY_MASCULINE]({
      attribute: 'O sobrenome',
    }),
  })
  lastName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePersonPhoneSchema)
  phone?: UpdatePersonPhoneSchema | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePersonDocumentSchema)
  document?: UpdatePersonDocumentSchema | null;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_DATE]({
      attribute: 'A data de nascimento',
    }),
  })
  birthDate?: string | null;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A ocupação',
    }),
  })
  occupation?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePersonMonthlyIncomeSchema)
  monthlyIncome?: UpdatePersonMonthlyIncomeSchema;

  @IsOptional()
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A moeda padrão',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_NOT_BE_EMPTY_FEMININE]({
      attribute: 'A moeda padrão',
    }),
  })
  defaultCurrency?: string | null;
}
