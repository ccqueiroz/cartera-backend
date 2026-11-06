import { readFileSync } from 'fs';
import { resolve } from 'path';

const srcDir = resolve(__dirname, '../../..');

type OpenApi = {
  components?: { schemas?: Record<string, { enum?: unknown }> };
};

const openapi: OpenApi = JSON.parse(
  readFileSync(resolve(__dirname, 'openapi.json'), 'utf8'),
);

// The enums are read as text: src/shared must not import src/features
// (shared-no-features in the dependency-cruiser, the ESLint restricted zone).
const typescriptEnumValues = (file: string): string[] =>
  Array.from(
    readFileSync(resolve(srcDir, file), 'utf8').matchAll(
      /[:=]\s*['"]([^'"]*)['"]/g,
    ),
    (match) => match[1],
  );

describe('[BK2-10] openapi.json component enums', () => {
  it.each([
    [
      'CategoryDescriptionEnum',
      'features/category/domain/enums/category-description.enum.ts',
    ],
    [
      'CategoryGroupEnum',
      'features/category/domain/enums/category-group.enum.ts',
    ],
    [
      'PaymentMethodDescriptionEnum',
      'features/payment-method/domain/enums/payment-method-description.enum.ts',
    ],
    [
      'PaymentStatusDescriptionEnum',
      'shared/kernel/enums/payment-status.enum.ts',
    ],
  ])('%s equals the TypeScript enum', (schemaName, enumFile) => {
    const expected = typescriptEnumValues(enumFile);

    expect(expected).not.toHaveLength(0);
    expect(openapi.components?.schemas?.[schemaName]?.enum).toEqual(expected);
  });
});

describe('[BK2-50] openapi.json nullable enum', () => {
  it('lists null in the enum of the nullable TransactionOutput period', () => {
    expect(openapi.components?.schemas?.TransactionOutput).toMatchObject({
      properties: {
        period: { nullable: true, enum: expect.arrayContaining([null]) },
      },
    });
  });
});
