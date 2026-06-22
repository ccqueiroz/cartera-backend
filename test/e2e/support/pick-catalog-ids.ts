import { request } from './http-client';

export interface CatalogIds {
  billCategoryEnum?: string;
  receivableCategoryEnum?: string;
  paymentMethodEnum: string;
  paymentStatusCode?: string;
}

type Item = Record<string, unknown>;

function asArray(value: unknown): Item[] {
  if (Array.isArray(value)) return value as Item[];
  const content = (value as Record<string, unknown>)?.content;
  return Array.isArray(content) ? (content as Item[]) : [];
}

function firstActiveEnum(value: unknown): string | undefined {
  const items = asArray(value);
  const active = items.find((item) => item.active !== false) ?? items[0];
  const candidate = active?.descriptionEnum;
  return candidate ? String(candidate) : undefined;
}

function firstCode(value: unknown): string | undefined {
  const code = asArray(value)[0]?.code;
  return code ? String(code) : undefined;
}

async function categoryEnumFor(
  token: string,
  type: string,
): Promise<string | undefined> {
  const res = await request('get', 'category/list-all', {
    token,
    query: { type },
  });
  return res.status === 200 ? firstActiveEnum(res.body) : undefined;
}

export async function pickCatalogIds(token: string): Promise<CatalogIds> {
  const [billCategoryEnum, receivableCategoryEnum, paymentMethods, statuses] =
    await Promise.all([
      categoryEnumFor(token, 'BILLS'),
      categoryEnumFor(token, 'RECEIVABLE'),
      request('get', 'payment-method/list-all', { token }),
      request('get', 'payment-status/list-all', { token }),
    ]);

  const paymentMethodEnum = firstActiveEnum(paymentMethods.body);
  if (!paymentMethodEnum) {
    throw new Error(
      `no active payment method in catalog: ${
        paymentMethods.status
      } ${JSON.stringify(paymentMethods.body)}`,
    );
  }

  return {
    billCategoryEnum,
    receivableCategoryEnum,
    paymentMethodEnum,
    paymentStatusCode: firstCode(statuses.body),
  };
}
