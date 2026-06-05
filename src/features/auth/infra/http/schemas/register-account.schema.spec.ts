import { RegisterAccountSchema } from './register-account.schema';
import { assertAuthInputValid } from '@/features/auth/infra/http/auth-input.validator';
import { DomainError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const VALID = {
  email: 'a@b.com',
  password: 'secret6',
  firstName: 'Ana',
  lastName: 'Souza',
};

const catchCode = async (input: unknown): Promise<ErrorCode> => {
  try {
    await assertAuthInputValid(RegisterAccountSchema, input);
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    return (error as DomainError).code;
  }
  throw new Error('era pra ter lançado');
};

describe('RegisterAccountSchema', () => {
  it('aceita payload válido', async () => {
    await expect(
      assertAuthInputValid(RegisterAccountSchema, VALID),
    ).resolves.toBeUndefined();
  });

  it('e-mail malformado vira INVALID_EMAIL', async () => {
    expect(await catchCode({ ...VALID, email: 'nao-eh-email' })).toBe(
      ErrorCode.INVALID_EMAIL,
    );
  });

  it.each(['password', 'firstName', 'lastName', 'email'])(
    'campo obrigatório ausente (%s) vira VALIDATION_FAILED',
    async (field) => {
      const input: Record<string, unknown> = { ...VALID };
      delete input[field];
      expect(await catchCode(input)).toBe(ErrorCode.VALIDATION_FAILED);
    },
  );

  it('senha curta (< 6) vira VALIDATION_FAILED', async () => {
    expect(await catchCode({ ...VALID, password: '12345' })).toBe(
      ErrorCode.VALIDATION_FAILED,
    );
  });

  it('props desconhecidas são descartadas sem erro', async () => {
    await expect(
      assertAuthInputValid(RegisterAccountSchema, {
        ...VALID,
        admin: true,
      }),
    ).resolves.toBeUndefined();
  });
});
