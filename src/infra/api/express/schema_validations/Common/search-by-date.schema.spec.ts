import { runValidate } from '@/packages/clients/class-validator';
import { SearchByDateDTO } from './search-by-date.schema';

describe('Search By Date Schema', () => {
  it('should be validate the attributes of the SearchByDateDTO withou errors and no pass params to constructor.', async () => {
    return runValidate<SearchByDateDTO>(SearchByDateDTO, {}).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the SearchByDateDTO withou errors and no pass initialDate params to constructor.', async () => {
    return runValidate<SearchByDateDTO>(SearchByDateDTO, {
      initialDate: 145667288272878,
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the SearchByDateDTO with errors of the number typing', async () => {
    return runValidate<SearchByDateDTO>(SearchByDateDTO, {
      initialDate: 'abc' as any,
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isNumber:
          'initialDate must be a number conforming to the specified constraints',
      });
    });
  });
});
