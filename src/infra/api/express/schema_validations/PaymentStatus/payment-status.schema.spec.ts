import { runValidate } from '@/packages/clients/class-validator';
import { GetPaymentStatusByIdValidationDTO } from './payment-status.schema';

describe('Payment Status Schema', () => {
  it('should be validate the attributes of the GetPaymentStatusByIdValidationDTO withou errors', async () => {
    return runValidate<GetPaymentStatusByIdValidationDTO>(
      GetPaymentStatusByIdValidationDTO,
      {
        id: '1991',
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });
});
