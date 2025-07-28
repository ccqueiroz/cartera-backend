import { runValidate } from '@/packages/clients/class-validator';
import {
  CategoryTypeEnum,
  GetCategoriesValidationDTO,
  GetCategoryByIdValidationDTO,
} from './category.schema';

describe('Category Schema', () => {
  it('should be validate the attributes of the GetCategoriesValidationDTO withou errors', async () => {
    return runValidate<GetCategoriesValidationDTO>(GetCategoriesValidationDTO, {
      type: CategoryTypeEnum.BILLS,
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the GetCategoriesValidationDTO with type error must be defined', async () => {
    return runValidate<GetCategoriesValidationDTO>(GetCategoriesValidationDTO, {
      type: 'ANY_TYPE' as any,
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isEnum: 'type must be one of the following values: 0, 1',
      });
    });
  });

  it('should be validate the attributes of the GetCategoryByIdValidationDTO withou errors', async () => {
    return runValidate<GetCategoryByIdValidationDTO>(
      GetCategoryByIdValidationDTO,
      {
        id: '1991',
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });
});
