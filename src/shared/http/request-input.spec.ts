import type { Request } from 'express';
import { IsString } from 'class-validator';
import {
  assertValid,
  booleanOrUndefined,
  DROP_UNKNOWN,
  numberOrUndefined,
  userIdFrom,
} from './request-input';
import {
  UnauthorizedError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

class SampleSchema {
  @IsString({
    message: errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'O nome',
    }),
  })
  name!: string;
}

describe('[BK2-15] request-input helpers', () => {
  it('numberOrUndefined treats empty, null and NaN as absent', () => {
    expect(numberOrUndefined('')).toBeUndefined();
    expect(numberOrUndefined(null)).toBeUndefined();
    expect(numberOrUndefined('abc')).toBeUndefined();
    expect(numberOrUndefined('12')).toBe(12);
  });

  it('booleanOrUndefined only accepts the literal strings', () => {
    expect(booleanOrUndefined('true')).toBe(true);
    expect(booleanOrUndefined('false')).toBe(false);
    expect(booleanOrUndefined('1')).toBeUndefined();
  });

  it('userIdFrom throws INVALID_TOKEN without a verified session', () => {
    expect(() => userIdFrom({} as Request)).toThrow(
      expect.objectContaining({ code: ErrorCode.INVALID_TOKEN }),
    );
    const emptyUserId = { user_auth: { userId: '' } } as Request;
    expect(() => userIdFrom(emptyUserId)).toThrow(UnauthorizedError);
    expect(() => userIdFrom(emptyUserId)).toThrow(
      expect.objectContaining({ code: ErrorCode.INVALID_TOKEN }),
    );
    expect(userIdFrom({ user_auth: { userId: 'u1' } } as Request)).toBe('u1');
  });

  it('assertValid rejects unknown fields by default and carries the PT-BR details', async () => {
    await expect(
      assertValid(SampleSchema, { name: 1, extra: true }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      params: {
        details:
          'property extra should not exist; ' +
          errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
            attribute: 'O nome',
          }),
      },
    });
  });

  it('assertValid rejects an unknown field when every known field is valid', async () => {
    const validation = assertValid(SampleSchema, { name: 'ok', extra: true });
    await expect(validation).rejects.toBeInstanceOf(ValidationError);
    await expect(validation).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
    });
  });

  it('assertValid drops unknown fields only when DROP_UNKNOWN is passed', async () => {
    await expect(
      assertValid(SampleSchema, { name: 'ok', extra: true }, DROP_UNKNOWN),
    ).resolves.toBeUndefined();
  });
});
