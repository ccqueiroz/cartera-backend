import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdatePaymentMethodSchema {
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @MaxLength(60, { message: 'A descrição excede o tamanho máximo (60).' })
  description!: string;
}
