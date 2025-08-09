import { runValidate } from '@/packages/clients/class-validator';
import {
  GetConsolidatedCashFlowByYearValidationDTO,
  GetMonthlySummaryCashFlowValidationDTO,
} from './cash-flow.schema';

describe('Cash Flow Schema', () => {
  it('should be validate the attributes of the GetConsolidatedCashFlowByYearValidationDTO withou errors.', async () => {
    return runValidate<GetConsolidatedCashFlowByYearValidationDTO>(
      GetConsolidatedCashFlowByYearValidationDTO,
      { year: 2025, authUserId: '1991' },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should validate successfully with all valid attributes', async () => {
    const errors = await runValidate<GetMonthlySummaryCashFlowValidationDTO>(
      GetMonthlySummaryCashFlowValidationDTO,
      {
        year: 2025,
        month: 7,
        paid: true,
        authUserId: 'user-123',
      },
    );

    expect(errors.length).toBe(0);
  });

  it('should validate successfully without optional paid attribute', async () => {
    const errors = await runValidate<GetMonthlySummaryCashFlowValidationDTO>(
      GetMonthlySummaryCashFlowValidationDTO,
      {
        year: 2025,
        month: 0,
        authUserId: 'user-123',
      },
    );

    expect(errors.length).toBe(0);
  });

  it('should fail validation if year is missing', async () => {
    const errors = await runValidate<GetMonthlySummaryCashFlowValidationDTO>(
      GetMonthlySummaryCashFlowValidationDTO,
      {
        month: 5,
        authUserId: 'user-123',
        year: undefined as any,
      },
    );

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation if year is not a number', async () => {
    const errors = await runValidate<GetMonthlySummaryCashFlowValidationDTO>(
      GetMonthlySummaryCashFlowValidationDTO,
      {
        year: '2025' as any,
        month: 5,
        authUserId: 'user-123',
      },
    );

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation if month is missing', async () => {
    const errors = await runValidate<GetMonthlySummaryCashFlowValidationDTO>(
      GetMonthlySummaryCashFlowValidationDTO,
      {
        year: 2025,
        authUserId: 'user-123',
        month: undefined as any,
      },
    );

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation if month is not a number', async () => {
    const errors = await runValidate<GetMonthlySummaryCashFlowValidationDTO>(
      GetMonthlySummaryCashFlowValidationDTO,
      {
        year: 2025,
        month: '7' as any,
        authUserId: 'user-123',
      },
    );

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation if paid is not a boolean', async () => {
    const errors = await runValidate<GetMonthlySummaryCashFlowValidationDTO>(
      GetMonthlySummaryCashFlowValidationDTO,
      {
        year: 2025,
        month: 7,
        paid: 'true' as any,
        authUserId: 'user-123',
      },
    );

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation if authUserId is missing', async () => {
    const errors = await runValidate<GetMonthlySummaryCashFlowValidationDTO>(
      GetMonthlySummaryCashFlowValidationDTO,
      {
        year: 2025,
        month: 7,
        paid: true,
        authUserId: undefined as any,
      },
    );

    expect(errors.length).toBeGreaterThan(0);
  });
});
