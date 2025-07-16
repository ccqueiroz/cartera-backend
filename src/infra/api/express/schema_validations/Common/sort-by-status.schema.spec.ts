import { runValidate } from '@/packages/clients/class-validator';
import { SortByStatusDTO } from './sort-by-status.schema';

describe('Sort By Status Schema', () => {
  it('should be validate the attributes of the SortByStatusDTO withou errors and pass params to constructor.', async () => {
    return runValidate<SortByStatusDTO>(SortByStatusDTO, {
      category: '99POP',
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the SortByStatusDTO withou errors and no pass params to constructor.', async () => {
    return runValidate<SortByStatusDTO>(SortByStatusDTO, {}).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the SortByStatusDTO with errors passing the more one sort attribute.', async () => {
    return runValidate<SortByStatusDTO>(SortByStatusDTO, {
      category: 'UBER',
      paymentStatus: 'TO_PAY',
    }).then((errors) => {
      expect(errors.length).toEqual(1);
    });
  });
});
