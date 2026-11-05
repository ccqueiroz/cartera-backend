import { ErrorCode } from './error-code';

describe('ErrorCode', () => {
  const entries = Object.entries(ErrorCode) as [string, string][];

  it('every member is in UPPER_SNAKE_CASE', () => {
    for (const [member] of entries) {
      expect(member).toMatch(/^[A-Z][A-Z0-9_]*$/);
    }
  });

  it('member name equals the token value', () => {
    for (const [member, value] of entries) {
      expect(value).toBe(member);
    }
  });

  it('has no duplicate values', () => {
    const values = entries.map(([, value]) => value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('includes the required base tokens', () => {
    expect(ErrorCode.VALIDATION_FAILED).toBeDefined();
    expect(ErrorCode.INTERNAL_SERVER_ERROR).toBeDefined();
  });

  it('inclui os tokens do fluxo de auth', () => {
    expect(ErrorCode.TOKEN_EXPIRED).toBeDefined();
    expect(ErrorCode.ACCOUNT_DELETED).toBeDefined();
  });
});
