import { runValidate } from '@/packages/clients/class-validator';
import {
  CreateReceivableValidationDTO,
  DeleteReceivableValidationDTO,
  EditReceivableValidationDTO,
  GetReceivableByIdValidationDTO,
  GetReceivablesByMonthDTO,
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
          category: 'ACCOMMODATION',
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
          category: 'BUS',
          paymentStatus: 'DUE_DAY',
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children?.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        OnlyOnePropertieDefined:
          'Only a accept a one of [category, categoryGroup, paymentStatus, paymentMethod] defined.',
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
          category: SortOrder.ASC,
        },
      },
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        OnlyOnePropertieDefined:
          'Only a accept a one of [amount, receivableDate, receivalDate, category, categoryGroup, paymentMethod, paymentStatus, createdAt, updatedAt] defined.',
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
          category: '99POP',
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
      categoryDescriptionEnum: 'BUS',
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
      categoryDescriptionEnum: 'BUS',
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
      categoryDescriptionEnum: 'BUS',
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
      categoryDescriptionEnum: 'BUS',
      createdAt: 18783929293293,
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
      categoryDescriptionEnum: 'BUS',
      createdAt: 18783929293293,
    };
    return runValidate<EditReceivableValidationDTO>(
      EditReceivableValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the paymentMethodDescriptionEnum attribute when this is not equals to "PaymentMethodDescriptionEnum" Enum', () => {
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
      categoryDescriptionEnum: 'BUS',
      paymentMethodDescriptionEnum: 'any' as any,
      createdAt: 18783929293293,
    };
    return runValidate<EditReceivableValidationDTO>(
      EditReceivableValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isIn: 'paymentMethodDescriptionEnum must be one of the following values: DEBIT_CARD, CREDIT_CARD, BANK_SLIP, BANK_DEPOSIT, BANK_TRANSFER, AUTOMATIC_DEBIT, BOOKLET, CASH, CHECK, PROMISSORY, FINANCING, MEAL_VOUCHER, FOOD_VOUCHER, PIX, CRYPTOCURRENCY',
      });
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

  it('should be validate the input attributes of the GetReceivablesByMonthDTO withou errors', async () => {
    return runValidate<GetReceivablesByMonthDTO>(GetReceivablesByMonthDTO, {
      initialDate: 1212121212121212,
      finalDate: 1212121212121212,
      authUserId: '20000',
      page: 0,
      size: 10,
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });
});
