import { ListUnpaidByPeriodSchema } from './list-unpaid-by-period.schema';
import { assertValid } from '@/shared/http/request-input';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const FIELDS: [string, ErrorCode][] = [
  ['start_date', ErrorCode.ATTRIBUTE_MUST_BE_DATE],
  ['end_date', ErrorCode.ATTRIBUTE_MUST_BE_DATE],
  ['page', ErrorCode.ATTRIBUTE_MUST_BE_NUMERIC_TEXT],
  ['size', ErrorCode.ATTRIBUTE_MUST_BE_NUMERIC_TEXT],
  ['ordering', ErrorCode.ATTRIBUTE_MUST_BE_TEXT],
  ['direction_order', ErrorCode.ATTRIBUTE_MUST_BE_TEXT],
  ['sort', ErrorCode.ATTRIBUTE_MUST_BE_TEXT],
  ['sort_value', ErrorCode.ATTRIBUTE_MUST_BE_TEXT],
  ['search_by_date', ErrorCode.ATTRIBUTE_MUST_BE_TEXT],
  ['search_by_date_value', ErrorCode.ATTRIBUTE_MUST_BE_TEXT],
];

describe('[BK2-58] ListUnpaidByPeriodSchema', () => {
  it('takes every field message from the error catalog', async () => {
    const input = Object.fromEntries(
      FIELDS.map(([attribute]) => [attribute, 1]),
    );

    await expect(
      assertValid(ListUnpaidByPeriodSchema, input),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      params: {
        details: FIELDS.map(([attribute, code]) =>
          errorCatalog[code]({ attribute }),
        ).join('; '),
      },
    });
  });
});
