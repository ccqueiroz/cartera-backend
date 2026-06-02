import { ErrorCode } from './error-code';
import { errorCatalog } from './error-catalog';

describe('errorCatalog', () => {
  const codes = Object.values(ErrorCode);

  it('cada ErrorCode resolve uma string PT não-vazia', () => {
    for (const code of codes) {
      const message = errorCatalog[code]();
      expect(typeof message).toBe('string');
      expect(message.trim().length).toBeGreaterThan(0);
    }
  });

  it('não há código sem entrada nem entrada órfã', () => {
    const catalogKeys = Object.keys(errorCatalog).sort();
    expect(catalogKeys).toEqual([...codes].sort());
  });

  it('interpola placeholders nos params', () => {
    const message = errorCatalog[ErrorCode.CATEGORY_NOT_FOUND]({
      descriptionEnum: 'UBER',
    });
    expect(message).toContain('UBER');
  });

  it('VALIDATION_FAILED interpola details', () => {
    const message = errorCatalog[ErrorCode.VALIDATION_FAILED]({
      details: 'description não pode ser vazio',
    });
    expect(message).toContain('description não pode ser vazio');
  });
});
