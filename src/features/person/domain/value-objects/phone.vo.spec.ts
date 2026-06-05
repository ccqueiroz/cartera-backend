import { Phone } from './phone.vo';
import { BusinessRuleViolationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

describe('Phone', () => {
  it('cria telefone com formato nacional válido', () => {
    const phone = Phone.create({
      number: '11987654321',
      countryCode: '+55',
      isWhatsapp: true,
    });
    expect(phone.number).toBe('11987654321');
    expect(phone.countryCode).toBe('+55');
    expect(phone.isWhatsapp).toBe(true);
  });

  it('aceita formato com máscara de exibição', () => {
    const phone = Phone.create({
      number: '(11) 98765-4321',
      countryCode: '+55',
      isWhatsapp: false,
    });
    expect(phone.isWhatsapp).toBe(false);
  });

  it('rejeita número fora do formato com INVALID_PHONE', () => {
    const error = (() => {
      try {
        Phone.create({ number: '123', countryCode: '+55', isWhatsapp: false });
      } catch (thrown) {
        return thrown as any;
      }
      throw new Error('esperava que lançasse');
    })();
    expect(error).toBeInstanceOf(BusinessRuleViolationError);
    expect(error.code).toBe(ErrorCode.INVALID_PHONE);
  });

  it('rejeita countryCode vazio', () => {
    expect(() =>
      Phone.create({
        number: '11987654321',
        countryCode: ' ',
        isWhatsapp: false,
      }),
    ).toThrow(BusinessRuleViolationError);
  });

  it('guarda isWhatsapp como declarado, sem verificação', () => {
    const declared = Phone.create({
      number: '11987654321',
      countryCode: '+55',
      isWhatsapp: true,
    });
    expect(declared.isWhatsapp).toBe(true);
  });
});
