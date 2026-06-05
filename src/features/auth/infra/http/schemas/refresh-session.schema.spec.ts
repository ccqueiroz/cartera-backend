import { RefreshSessionSchema } from './refresh-session.schema';
import { assertAuthInputValid } from '@/features/auth/infra/http/auth-input.validator';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

describe('RefreshSessionSchema', () => {
  it('aceita refresh token presente', async () => {
    await expect(
      assertAuthInputValid(RefreshSessionSchema, { refreshToken: 'token' }),
    ).resolves.toBeUndefined();
  });

  it('refresh token ausente vira VALIDATION_FAILED', async () => {
    await expect(
      assertAuthInputValid(RefreshSessionSchema, {}),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
  });
});
