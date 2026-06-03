import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  PaymentMethodDescription,
  PaymentMethodDescriptionEnum,
} from '@/features/payment-method/domain/enums/payment-method-description.enum';

const DESCRIPTION_ENUMS = Object.values(PaymentMethodDescriptionEnum);

export class CreatePaymentMethodSchema {
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @MaxLength(60, { message: 'A descrição excede o tamanho máximo (60).' })
  description!: string;

  @IsIn(DESCRIPTION_ENUMS, {
    message:
      'O identificador da forma de pagamento (descriptionEnum) é inválido.',
  })
  descriptionEnum!: PaymentMethodDescription;
}
