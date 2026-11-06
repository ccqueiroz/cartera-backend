import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from '@/packages/clients/class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class LoginSchema {
  @IsEmail(
    {},
    {
      message: errorCatalog[ErrorCode.ATTRIBUTE_IS_INVALID_MASCULINE]({
        attribute: 'O e-mail informado',
      }),
    },
  )
  email!: string;

  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'A senha',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_FEMININE]({
      attribute: 'A senha',
    }),
  })
  password!: string;
}
