import { ErrorCode } from './error-code';

describe('ErrorCode', () => {
  const entries = Object.entries(ErrorCode) as [string, string][];

  it('todo membro está em UPPER_SNAKE_CASE', () => {
    for (const [member] of entries) {
      expect(member).toMatch(/^[A-Z][A-Z0-9_]*$/);
    }
  });

  it('nome do membro é igual ao valor do token', () => {
    for (const [member, value] of entries) {
      expect(value).toBe(member);
    }
  });

  it('não tem valores duplicados', () => {
    const values = entries.map(([, value]) => value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('inclui os tokens base obrigatórios', () => {
    expect(ErrorCode.VALIDATION_FAILED).toBeDefined();
    expect(ErrorCode.INTERNAL_SERVER_ERROR).toBeDefined();
  });
});
