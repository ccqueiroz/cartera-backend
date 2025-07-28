import { runValidate } from '@/packages/clients/class-validator';
import { GetInvoicesByCategoriesAndPeriodValidationDTO } from './invoice.schema';
import { CategoryTypeEnum } from '../Category/category.schema';

describe('Invoice Schema', () => {
  it('should be validate the attributes od the GetInvoicesByCategoriesAndPeriodValidationDTO without errors', async () => {
    return runValidate<GetInvoicesByCategoriesAndPeriodValidationDTO>(
      GetInvoicesByCategoriesAndPeriodValidationDTO,
      {
        authUserId: '1991',
        initialDate: new Date('2025-07-26').getTime(),
        finalDate: new Date('2025-07-26').getTime(),
        type: CategoryTypeEnum.BILLS,
        paid: true,
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes od the GetInvoicesByCategoriesAndPeriodValidationDTO with type error must be defined', async () => {
    return runValidate<GetInvoicesByCategoriesAndPeriodValidationDTO>(
      GetInvoicesByCategoriesAndPeriodValidationDTO,
      {
        authUserId: '1991',
        initialDate: new Date('2025-07-26').getTime(),
        finalDate: new Date('2025-07-26').getTime(),
        type: 'any' as any,
        paid: true,
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isEnum: 'type must be one of the following values: 0, 1',
      });
    });
  });

  it('should be validate the attributes od the GetInvoicesByCategoriesAndPeriodValidationDTO with initialDate error must be defined', async () => {
    return runValidate<GetInvoicesByCategoriesAndPeriodValidationDTO>(
      GetInvoicesByCategoriesAndPeriodValidationDTO,
      {
        authUserId: '1991',
        initialDate: NaN,
        finalDate: new Date('2025-07-26').getTime(),
        type: CategoryTypeEnum.BILLS,
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isNumber:
          'initialDate must be a number conforming to the specified constraints',
      });
    });
  });

  it('should be validate the attributes od the GetInvoicesByCategoriesAndPeriodValidationDTO with finalDate error must be defined', async () => {
    return runValidate<GetInvoicesByCategoriesAndPeriodValidationDTO>(
      GetInvoicesByCategoriesAndPeriodValidationDTO,
      {
        authUserId: '1991',
        initialDate: new Date('2025-07-26').getTime(),
        finalDate: NaN,
        type: CategoryTypeEnum.BILLS,
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isNumber:
          'finalDate must be a number conforming to the specified constraints',
      });
    });
  });
});
