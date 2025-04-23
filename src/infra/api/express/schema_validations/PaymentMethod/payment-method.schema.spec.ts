import { runValidate } from '@/packages/clients/class-validator';
import { GetPaymentMethodByIdValidationDTO } from './payment-method.schema';

describe('Payment Method Schema', () => {
  it('should be validate the attributes of the GetPaymentMethodByIdValidationDTO withou errors', async () => {
    return runValidate<GetPaymentMethodByIdValidationDTO>(
      GetPaymentMethodByIdValidationDTO,
      { id: '1991' },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });
});
