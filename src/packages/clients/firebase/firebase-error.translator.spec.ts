import { translateFirebaseError } from './firebase-error.translator';
import { DomainError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const catchCode = (error: unknown): ErrorCode => {
  try {
    translateFirebaseError(error);
  } catch (thrown) {
    expect(thrown).toBeInstanceOf(DomainError);
    return (thrown as DomainError).code;
  }
  throw new Error('translateFirebaseError não lançou');
};

describe('translateFirebaseError', () => {
  const knownByCode: [string, ErrorCode][] = [
    ['auth/too-many-requests', ErrorCode.TOO_MANY_REQUESTS],
    ['auth/id-token-expired', ErrorCode.TOKEN_EXPIRED],
    ['auth/timeout', ErrorCode.TIMEOUT],
    ['auth/invalid-email', ErrorCode.INVALID_EMAIL],
    ['auth/user-disabled', ErrorCode.USER_DISABLED],
    ['auth/user-not-found', ErrorCode.ACCOUNT_NOT_FOUND],
    ['auth/email-already-in-use', ErrorCode.EMAIL_ALREADY_IN_USE],
    ['auth/invalid-credential', ErrorCode.INVALID_CREDENTIALS],
    ['auth/network-request-failed', ErrorCode.INTERNAL_SERVER_ERROR],
    ['not-found', ErrorCode.USER_NOT_FOUND],
  ];

  it.each(knownByCode)(
    'traduz o firebase code %s para o ErrorCode mapeado',
    (firebaseCode, expected) => {
      expect(catchCode({ code: firebaseCode })).toBe(expected);
    },
  );

  it('traduz códigos vindos no message (ex.: INVALID_LOGIN_CREDENTIALS)', () => {
    expect(catchCode({ message: 'INVALID_LOGIN_CREDENTIALS' })).toBe(
      ErrorCode.INVALID_CREDENTIALS,
    );
  });

  it('throttle do REST (TOO_MANY_ATTEMPTS_TRY_LATER) vira TOO_MANY_REQUESTS', () => {
    expect(catchCode({ message: 'TOO_MANY_ATTEMPTS_TRY_LATER' })).toBe(
      ErrorCode.TOO_MANY_REQUESTS,
    );
  });

  it('refresh token expirado (REST TOKEN_EXPIRED) segue INVALID_TOKEN — relogin, não refresh', () => {
    expect(catchCode({ message: 'TOKEN_EXPIRED' })).toBe(
      ErrorCode.INVALID_TOKEN,
    );
  });

  it('nenhum código cru do provider traduz para ACCOUNT_DELETED (decisão do fluxo de login, não do provider)', () => {
    const allRawCodes = [
      ...knownByCode.map(([raw]) => raw),
      'INVALID_LOGIN_CREDENTIALS',
      'INVALID_ID_TOKEN',
      'INVALID_REFRESH_TOKEN',
      'TOKEN_EXPIRED',
      'EMAIL_NOT_FOUND',
      'INVALID_PASSWORD',
      'auth/argument-error',
      'auth/quantum-glitch',
    ];
    for (const raw of allRawCodes) {
      expect(catchCode({ code: raw, message: raw })).not.toBe(
        ErrorCode.ACCOUNT_DELETED,
      );
    }
  });

  it('código desconhecido vira INTERNAL_SERVER_ERROR', () => {
    expect(catchCode({ code: 'auth/quantum-glitch' })).toBe(
      ErrorCode.INTERNAL_SERVER_ERROR,
    );
  });

  it('entrada sem code/message vira INTERNAL_SERVER_ERROR', () => {
    expect(catchCode(null)).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    expect(catchCode({})).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
  });

  it('não vaza code/message cru do firebase no erro lançado', () => {
    let thrown: DomainError | undefined;
    try {
      translateFirebaseError({ code: 'auth/quantum-glitch', message: 'raw' });
    } catch (error) {
      thrown = error as DomainError;
    }
    expect(thrown?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    expect(thrown?.message).not.toContain('quantum-glitch');
    expect(thrown?.message).not.toContain('raw');
  });
});
