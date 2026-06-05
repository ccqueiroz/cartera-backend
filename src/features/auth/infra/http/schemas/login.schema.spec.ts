import { LoginSchema } from './login.schema';
import { assertAuthInputValid } from '@/features/auth/infra/http/auth-input.validator';
import { DomainError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const VALID = { email: 'a@b.com', password: 'secret' };

const catchCode = async (input: unknown): Promise<ErrorCode> => {
  try {
    await assertAuthInputValid(LoginSchema, input);
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    return (error as DomainError).code;
  }
  throw new Error('era pra ter lançado');
};

describe('LoginSchema', () => {
  it('aceita payload válido', async () => {
    await expect(
      assertAuthInputValid(LoginSchema, VALID),
    ).resolves.toBeUndefined();
  });

  it('e-mail malformado vira INVALID_EMAIL', async () => {
    expect(await catchCode({ ...VALID, email: 'ruim' })).toBe(
      ErrorCode.INVALID_EMAIL,
    );
  });

  it('e-mail ausente vira VALIDATION_FAILED (não INVALID_EMAIL)', async () => {
    expect(await catchCode({ password: 'secret' })).toBe(
      ErrorCode.VALIDATION_FAILED,
    );
  });

  it('senha ausente vira VALIDATION_FAILED', async () => {
    expect(await catchCode({ email: 'a@b.com' })).toBe(
      ErrorCode.VALIDATION_FAILED,
    );
  });
});
