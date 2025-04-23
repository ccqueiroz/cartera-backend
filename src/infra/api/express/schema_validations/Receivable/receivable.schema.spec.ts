import { runValidate } from '@/packages/clients/class-validator';
import {
  CreateReceivableValidationDTO,
  DeleteReceivableValidationDTO,
  EditReceivableValidationDTO,
  GetReceivableByIdValidationDTO,
  GetReceivablesInputValidationDTO,
} from './receivable.schema';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';

describe('Receivable Schema', () => {
  it('should be validate the attributes of the GetReceivablesInputValidationDTO withou errors.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: 0,
        size: 10,
        authUserId: '1991',
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the GetReceivablesInputValidationDTO with page errors.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: undefined as any,
        size: 10,
        authUserId: '1991',
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isNumber:
          'page must be a number conforming to the specified constraints',
      });
    });
  });

  it('should be validate the attributes of the GetReceivablesInputValidationDTO without errors passing the sort attribute.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: 0,
        size: 10,
        authUserId: '1991',
        sort: {
          categoryId: '2000',
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the GetReceivablesInputValidationDTO with errors passing the more one sort attribute.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: 0,
        size: 10,
        authUserId: '1991',
        sort: {
          categoryId: '1991',
          paymentStatusId: '1991',
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children?.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        OnlyOnePropertieDefined:
          'Only a accept a one of [categoryId, paymentStatusId, paymentMethodId] defined.',
      });
    });
  });

  it('should be validate the attributes of the GetReceivablesInputValidationDTO without errors passing the sortByReceivables attribute.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: 0,
        size: 10,
        authUserId: '1991',
        sortByReceivables: {
          receival: true,
          fixedReceivable: false,
          amount: 1200.0,
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the GetReceivablesInputValidationDTO with errors passing the sortByReceivables attribute with "amount" more than 3 max decimal places.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: 0,
        size: 10,
        authUserId: '1991',
        sortByReceivables: {
          amount: 1200.2763,
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        isNumber:
          'amount must be a number conforming to the specified constraints',
      });
    });
  });

  it('should be validate the attributes of the GetReceivablesInputValidationDTO with errors passing the sortByReceivables attribute with receival and/or fixedReceivable with different type of the boolean.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: 0,
        size: 10,
        authUserId: '1991',
        sortByReceivables: {
          fixedReceivable: 1200.2763 as any,
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        isBoolean: 'fixedReceivable must be a boolean value',
      });
    });
  });

  it('should be validate the attributes of the GetReceivablesInputValidationDTO without errors passing the searchByDate attribute.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: 0,
        size: 10,
        authUserId: '1991',
        searchByDate: {
          receivalDate: { initialDate: 19999889, finalDate: 9899999 },
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the GetReceivablesInputValidationDTO with errors passing the more one searchByDate attribute.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: 0,
        size: 10,
        authUserId: '1991',
        searchByDate: {
          receivalDate: { initialDate: 19999889, finalDate: 9899999 },
          receivableDate: { initialDate: 19999889, finalDate: 9899999 },
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        OnlyOnePropertieDefined:
          'Only a accept a one of [receivableDate, receivalDate] defined.',
      });
    });
  });

  it('should be validate the attributes of the GetReceivablesInputValidationDTO without errors passing the ordering attribute.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: 0,
        size: 10,
        authUserId: '1991',
        ordering: {
          amount: SortOrder.ASC,
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the GetReceivablesInputValidationDTO with errors passing the more one ordering attribute.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: 0,
        size: 10,
        authUserId: '1991',
        ordering: {
          amount: SortOrder.ASC,
          categoryId: SortOrder.ASC,
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        OnlyOnePropertieDefined:
          'Only a accept a one of [amount, receivableDate, receivalDate, categoryId, paymentMethodId, paymentStatusId, createdAt, updatedAt] defined.',
      });
    });
  });

  it('should be validate the attributes of the GetReceivablesInputValidationDTO withou errors and with all possible parameters filled.', async () => {
    return runValidate<GetReceivablesInputValidationDTO>(
      GetReceivablesInputValidationDTO,
      {
        page: 0,
        size: 10,
        authUserId: '1991',
        ordering: {
          amount: SortOrder.ASC,
        },
        searchByDate: {
          receivalDate: { initialDate: 19999889, finalDate: 9899999 },
        },
        sort: {
          categoryId: '2000',
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the input attributes of the GetReceivableByIdValidationDTO withou errors', async () => {
    return runValidate<GetReceivableByIdValidationDTO>(
      GetReceivableByIdValidationDTO,
      {
        id: '1900',
        authUserId: '20000',
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the input attributes of the GetReceivableByIdValidationDTO with errors when dont passing correctly id.', async () => {
    return runValidate<GetReceivableByIdValidationDTO>(
      GetReceivableByIdValidationDTO,
      {
        id: undefined as any,
        authUserId: '20000',
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
    });
  });

  it('should be validate the input attributes of the CreateReceivableValidationDTO withou errors', async () => {
    const model: CreateReceivableValidationDTO = {
      authUserId: '2991',
      userId: '12339',
      personUserId: '1928abc',
      descriptionReceivable: 'Description to Receivable',
      fixedReceivable: true,
      receivableDate: 1982828888888,
      receivalDate: 98398787878,
      receival: false,
      icon: 'https://wwww.teste-icon.com',
      amount: 7627.89,
      paymentStatusId: '267890',
      paymentStatusDescription: 'paymentStatus',
      categoryId: '267890',
      categoryDescription: 'category',
      paymentMethodId: '267890',
      paymentMethodDescription: 'paymentMethod',
    };
    return runValidate<CreateReceivableValidationDTO>(
      CreateReceivableValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the icon input attribute with not url.', async () => {
    const model: CreateReceivableValidationDTO = {
      authUserId: '2991',
      userId: '12339',
      personUserId: '1928abc',
      descriptionReceivable: 'Description to Receivable',
      fixedReceivable: true,
      receivableDate: 1982828888888,
      receivalDate: 98398787878,
      receival: false,
      icon: 'this-is-not-url',
      amount: 7627.89,
      paymentStatusId: '267890',
      paymentStatusDescription: 'paymentStatus',
      categoryId: '267890',
      categoryDescription: 'category',
      paymentMethodId: '267890',
      paymentMethodDescription: 'paymentMethod',
    };
    return runValidate<CreateReceivableValidationDTO>(
      CreateReceivableValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isUrl: 'icon must be a URL address',
      });
    });
  });

  it('should be validate the icon input attribute with null.', async () => {
    const model: CreateReceivableValidationDTO = {
      authUserId: '2991',
      userId: '12339',
      personUserId: '1928abc',
      descriptionReceivable: 'Description to Receivable',
      fixedReceivable: true,
      receivableDate: 1982828888888,
      receivalDate: 98398787878,
      receival: false,
      icon: null,
      amount: 7627.89,
      paymentStatusId: '267890',
      paymentStatusDescription: 'paymentStatus',
      categoryId: '267890',
      categoryDescription: 'category',
      paymentMethodId: '267890',
      paymentMethodDescription: 'paymentMethod',
    };
    return runValidate<CreateReceivableValidationDTO>(
      CreateReceivableValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the input attributes of the EditReceivableValidationDTO withou errors.', async () => {
    const model: EditReceivableValidationDTO = {
      authUserId: '2991',
      id: '7282929',
      userId: '12339',
      personUserId: '1928abc',
      descriptionReceivable: 'Description to Receivable',
      fixedReceivable: true,
      receivableDate: 1982828888888,
      receivalDate: 98398787878,
      receival: false,
      icon: 'https://wwww.teste-icon.com',
      amount: 7627.89,
      paymentStatusId: '267890',
      paymentStatusDescription: 'paymentStatus',
      categoryId: '267890',
      categoryDescription: 'category',
      paymentMethodId: '267890',
      paymentMethodDescription: 'paymentMethod',
      createdAt: 18783929293293,
      updatedAt: 127899999939339,
    };
    return runValidate<EditReceivableValidationDTO>(
      EditReceivableValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the updatedAt input attribute with null.', async () => {
    const model: EditReceivableValidationDTO = {
      authUserId: '2991',
      id: '7282929',
      userId: '12339',
      personUserId: '1928abc',
      descriptionReceivable: 'Description to Receivable',
      fixedReceivable: true,
      receivableDate: 1982828888888,
      receivalDate: 98398787878,
      receival: false,
      icon: 'https://wwww.teste-icon.com',
      amount: 7627.89,
      paymentStatusId: '267890',
      paymentStatusDescription: 'paymentStatus',
      categoryId: '267890',
      categoryDescription: 'category',
      paymentMethodId: '267890',
      paymentMethodDescription: 'paymentMethod',
      createdAt: 18783929293293,
      updatedAt: null,
    };
    return runValidate<EditReceivableValidationDTO>(
      EditReceivableValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the input attributes of the DeleteReceivableValidationDTO withou errors', async () => {
    return runValidate<DeleteReceivableValidationDTO>(
      DeleteReceivableValidationDTO,
      {
        id: '1900',
        authUserId: '20000',
      },
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });
});
