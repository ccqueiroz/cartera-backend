import { RecoverPasswordSchema } from './recover-password.schema';
import { assertAuthInputValid } from '@/features/auth/infra/http/auth-input.validator';
import { DomainError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const catchCode = async (input: unknown): Promise<ErrorCode> => {
  try {
    await assertAuthInputValid(RecoverPasswordSchema, input);
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    return (error as DomainError).code;
  }
  throw new Error('era pra ter lançado');
};

describe('RecoverPasswordSchema', () => {
  it('aceita e-mail válido', async () => {
    await expect(
      assertAuthInputValid(RecoverPasswordSchema, { email: 'a@b.com' }),
    ).resolves.toBeUndefined();
  });

  it('e-mail malformado vira INVALID_EMAIL', async () => {
    expect(await catchCode({ email: 'ruim' })).toBe(ErrorCode.INVALID_EMAIL);
  });

  it('e-mail ausente vira VALIDATION_FAILED', async () => {
    expect(await catchCode({})).toBe(ErrorCode.VALIDATION_FAILED);
  });
});
