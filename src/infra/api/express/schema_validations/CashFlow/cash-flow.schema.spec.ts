import { runValidate } from '@/packages/clients/class-validator';
import { GetConsolidatedCashFlowByYearValidationDTO } from './cash-flow.schema';

describe('Cash Flow Schema', () => {
  it('should be validate the attributes of the GetConsolidatedCashFlowByYearValidationDTO withou errors.', async () => {
    return runValidate<GetConsolidatedCashFlowByYearValidationDTO>(
      GetConsolidatedCashFlowByYearValidationDTO,
      { year: 2025, authUserId: '1991' },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });
});
