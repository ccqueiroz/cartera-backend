import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateWalletSchema {
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da carteira é obrigatório.' })
  name!: string;

  @IsOptional()
  @IsNumber({}, { message: 'O saldo inicial deve ser um número.' })
  balance?: number;

  @IsOptional()
  @IsBoolean({ message: 'hasOverdraft deve ser um booleano.' })
  hasOverdraft?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'O limite do cheque deve ser um número.' })
  @Min(0, { message: 'O limite do cheque não pode ser negativo.' })
  overdraftLimit?: number;

  @IsOptional()
  @IsNumber({}, { message: 'A taxa mensal deve ser um número.' })
  @Min(0, { message: 'A taxa mensal não pode ser negativa.' })
  overdraftMonthlyRate?: number;

  @IsOptional()
  @IsInt({ message: 'A carência deve ser um número inteiro de dias.' })
  @Min(0, { message: 'A carência não pode ser negativa.' })
  overdraftGraceDays?: number;
}
