import { UpdatePersonSchema } from './update-person.schema';
import {
  runValidate,
  ValidatorOptions,
} from '@/packages/clients/class-validator';

const DROP_UNKNOWN: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: false,
};

describe('UpdatePersonSchema', () => {
  it('aceita body parcial válido', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      {
        firstName: 'Caio',
        document: { type: 'CPF', value: '39053344705' },
        phone: { number: '11987654321', countryCode: '+55', isWhatsapp: true },
        birthDate: '1990-01-15',
        monthlyIncome: { value: 10000, currency: 'BRL' },
        defaultCurrency: 'BRL',
      },
      DROP_UNKNOWN,
    );
    expect(errors).toHaveLength(0);
  });

  it('aceita body vazio (PATCH sem campos)', async () => {
    const errors = await runValidate(UpdatePersonSchema, {}, DROP_UNKNOWN);
    expect(errors).toHaveLength(0);
  });

  it('descarta props desconhecidas (email, avatarUrl) sem erro', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      { email: 'hack@example.com', avatarUrl: 'http://x', firstName: 'Caio' },
      DROP_UNKNOWN,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejeita birthDate fora de YYYY-MM-DD', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      { birthDate: '15/01/1990' },
      DROP_UNKNOWN,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita document.type fora de CPF|CNPJ', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      { document: { type: 'RG', value: '123' } },
      DROP_UNKNOWN,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita phone sem isWhatsapp booleano', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      {
        phone: { number: '11987654321', countryCode: '+55', isWhatsapp: 'sim' },
      },
      DROP_UNKNOWN,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita monthlyIncome.value negativo', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      { monthlyIncome: { value: -1, currency: 'BRL' } },
      DROP_UNKNOWN,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita firstName vazio', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      { firstName: '' },
      DROP_UNKNOWN,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
