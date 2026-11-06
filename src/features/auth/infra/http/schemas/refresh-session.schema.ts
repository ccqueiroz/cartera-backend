import { IsNotEmpty, IsString } from '@/packages/clients/class-validator';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class RefreshSessionSchema {
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O refresh token',
    }),
  })
  @IsNotEmpty({
    message: errorCatalog[ErrorCode.ATTRIBUTE_IS_REQUIRED_MASCULINE]({
      attribute: 'O refresh token',
    }),
  })
  refreshToken!: string;
}
