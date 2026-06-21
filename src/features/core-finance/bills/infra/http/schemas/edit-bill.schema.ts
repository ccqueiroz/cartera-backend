import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class EditBillSchema {
  @IsOptional()
  @IsNumber({}, { message: 'O valor deve ser um número.' })
  amount?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'O vencimento deve estar no formato YYYY-MM-DD.',
  })
  dueDate?: string;

  @IsOptional()
  @IsString({ message: 'A categoria deve ser um texto.' })
  categoryDescriptionEnum?: string;

  @IsOptional()
  @IsBoolean({ message: 'A propagação deve ser booleana.' })
  propagate?: boolean;
}
