import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from '@/packages/clients/class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class RegisterAccountSchema {
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
  // Regra dura do Firebase Auth: senha < 6 caracteres é rejeitada pelo provider.
  @MinLength(6, {
    message: errorCatalog[ErrorCode.ATTRIBUTE_BELOW_MIN_LENGTH]({
      attribute: 'A senha',
      min: 6,
    }),
  })
  password!: string;

  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O primeiro nome',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_MASCULINE]({
      attribute: 'O primeiro nome',
    }),
  })
  firstName!: string;

  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O sobrenome',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_MASCULINE]({
      attribute: 'O sobrenome',
    }),
  })
  lastName!: string;
}
