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
  it('accepts a valid partial body', async () => {
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

  it('accepts an empty body (PATCH with no fields)', async () => {
    const errors = await runValidate(UpdatePersonSchema, {}, DROP_UNKNOWN);
    expect(errors).toHaveLength(0);
  });

  it('drops unknown props (email, avatarUrl) without error', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      { email: 'hack@example.com', avatarUrl: 'http://x', firstName: 'Caio' },
      DROP_UNKNOWN,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejects a birthDate outside YYYY-MM-DD', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      { birthDate: '15/01/1990' },
      DROP_UNKNOWN,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a document.type outside CPF|CNPJ', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      { document: { type: 'RG', value: '123' } },
      DROP_UNKNOWN,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a phone without a boolean isWhatsapp', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      {
        phone: { number: '11987654321', countryCode: '+55', isWhatsapp: 'sim' },
      },
      DROP_UNKNOWN,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a negative monthlyIncome.value', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      { monthlyIncome: { value: -1, currency: 'BRL' } },
      DROP_UNKNOWN,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an empty firstName', async () => {
    const errors = await runValidate(
      UpdatePersonSchema,
      { firstName: '' },
      DROP_UNKNOWN,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
