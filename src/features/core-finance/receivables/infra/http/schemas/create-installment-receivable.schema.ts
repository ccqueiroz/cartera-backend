import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateInstallmentReceivableSchema {
  @IsOptional()
  @IsString({ message: 'A pessoa deve ser um texto.' })
  personId?: string;

  @IsNumber({}, { message: 'O valor total deve ser um número.' })
  amount!: number;

  @Matches(DATE, { message: 'O vencimento deve estar no formato YYYY-MM-DD.' })
  dueDate!: string;

  @IsOptional()
  @IsString({ message: 'A categoria deve ser um texto.' })
  categoryDescriptionEnum?: string;

  @IsOptional()
  @IsBoolean({ message: 'O custo-fixo deve ser booleano.' })
  isFixedCost?: boolean;

  @IsOptional()
  @IsString({ message: 'O período deve ser um texto.' })
  period?: string;

  @IsOptional()
  @IsNumber({}, { message: 'A frequência deve ser um número.' })
  frequency?: number;

  @IsArray({ message: 'As parcelas devem ser uma lista.' })
  @ArrayMinSize(1, { message: 'Informe ao menos uma parcela.' })
  installments!: unknown[];

  @IsOptional()
  @IsObject({ message: 'A entrada deve ser um objeto.' })
  entry?: unknown;
}
