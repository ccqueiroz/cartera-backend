import { IsEmail } from '@/packages/clients/class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class RecoverPasswordSchema {
  @IsEmail(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_IS_INVALID_MASCULINE]({
        attribute: 'O e-mail informado',
      }),
    },
  )
  email!: string;
}
