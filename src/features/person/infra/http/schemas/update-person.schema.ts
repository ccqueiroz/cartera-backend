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

class UpdatePersonPhoneSchema {
  @IsString({ message: 'O número do telefone deve ser um texto.' })
  @IsNotEmpty({ message: 'O número do telefone é obrigatório.' })
  number!: string;

  @IsString({ message: 'O código do país deve ser um texto.' })
  @IsNotEmpty({ message: 'O código do país é obrigatório.' })
  countryCode!: string;

  @IsBoolean({ message: 'isWhatsapp deve ser um booleano.' })
  isWhatsapp!: boolean;
}

class UpdatePersonDocumentSchema {
  @IsIn(['CPF', 'CNPJ'], {
    message: 'O tipo do documento deve ser CPF ou CNPJ.',
  })
  type!: string;

  @IsString({ message: 'O valor do documento deve ser um texto.' })
  @IsNotEmpty({ message: 'O valor do documento é obrigatório.' })
  value!: string;
}

class UpdatePersonMonthlyIncomeSchema {
  @IsOptional()
  @IsNumber({}, { message: 'A renda mensal deve ser um número.' })
  @Min(0, { message: 'A renda mensal não pode ser negativa.' })
  value?: number | null;

  @IsOptional()
  @IsString({ message: 'A moeda da renda mensal deve ser um texto.' })
  @IsNotEmpty({ message: 'A moeda da renda mensal não pode ser vazia.' })
  currency?: string | null;
}

export class UpdatePersonSchema {
  @IsOptional()
  @IsString({ message: 'O primeiro nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O primeiro nome não pode ser vazio.' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'O sobrenome deve ser um texto.' })
  @IsNotEmpty({ message: 'O sobrenome não pode ser vazio.' })
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
    message: 'A data de nascimento deve estar no formato YYYY-MM-DD.',
  })
  birthDate?: string | null;

  @IsOptional()
  @IsString({ message: 'A ocupação deve ser um texto.' })
  occupation?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePersonMonthlyIncomeSchema)
  monthlyIncome?: UpdatePersonMonthlyIncomeSchema;

  @IsOptional()
  @IsString({ message: 'A moeda padrão deve ser um texto.' })
  @IsNotEmpty({ message: 'A moeda padrão não pode ser vazia.' })
  defaultCurrency?: string | null;
}
