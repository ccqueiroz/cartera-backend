import { runValidate } from '@/packages/clients/class-validator';
// import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import {
  CreateBillValidationDTO,
  DeleteBillValidationDTO,
  EditBillValidationDTO,
  GetBillByIdValidationDTO,
  GetBillsInputValidationDTO,
  GetBillsPayableMonthDTO,
} from './bill.schema';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';

describe('Bill Schema', () => {
  it('should be validate the attributes of the GetBillsInputValidationDTO withou errors.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: 0,
      size: 10,
      authUserId: '1991',
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the GetBillsInputValidationDTO with page errors.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: undefined as any,
      size: 10,
      authUserId: '1991',
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isNumber:
          'page must be a number conforming to the specified constraints',
      });
    });
  });

  it('should be validate the attributes of the GetBillsInputValidationDTO without errors passing the sort attribute.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: 0,
      size: 10,
      authUserId: '1991',
      sort: {
        categoryId: '2000',
      },
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the GetBillsInputValidationDTO with errors passing the more one sort attribute.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: 0,
      size: 10,
      authUserId: '1991',
      sort: {
        categoryId: '1991',
        paymentStatusId: '1991',
      },
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children?.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        OnlyOnePropertieDefined:
          'Only a accept a one of [categoryId, paymentStatusId, paymentMethodId] defined.',
      });
    });
  });

  it('should be validate the attributes of the GetBillsInputValidationDTO without errors passing the sortByBills attribute.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: 0,
      size: 10,
      authUserId: '1991',
      sortByBills: {
        fixedBill: true,
        payOut: false,
        isShoppingListBill: false,
        isPaymentCardBill: false,
        amount: 1200.0,
      },
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the GetBillsInputValidationDTO with errors passing the sortByBills attribute with "amount" more than 3 max decimal places.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: 0,
      size: 10,
      authUserId: '1991',
      sortByBills: {
        amount: 1200.2763,
      },
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        isNumber:
          'amount must be a number conforming to the specified constraints',
      });
    });
  });

  it('should be validate the attributes of the GetBillsInputValidationDTO with errors passing the sortByBills attribute with receival and/or fixedReceivable with different type of the boolean.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: 0,
      size: 10,
      authUserId: '1991',
      sortByBills: {
        fixedBill: 1200.2763 as any,
      },
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        isBoolean: 'fixedBill must be a boolean value',
      });
    });
  });

  it('should be validate the attributes of the GetBillsInputValidationDTO without errors passing the searchByDate attribute.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: 0,
      size: 10,
      authUserId: '1991',
      searchByDate: {
        billDate: { initialDate: 19999889, finalDate: 9899999 },
      },
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the GetBillsInputValidationDTO with errors passing the more one searchByDate attribute.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: 0,
      size: 10,
      authUserId: '1991',
      searchByDate: {
        billDate: { initialDate: 19999889, finalDate: 9899999 },
        payDate: { initialDate: 19999889, finalDate: 9899999 },
      },
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        OnlyOnePropertieDefined:
          'Only a accept a one of [billDate, payDate] defined.',
      });
    });
  });

  it('should be validate the attributes of the GetBillsInputValidationDTO without errors passing the ordering attribute.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: 0,
      size: 10,
      authUserId: '1991',
      ordering: {
        amount: SortOrder.ASC,
      },
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the GetBillsInputValidationDTO with errors passing the more one ordering attribute.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: 0,
      size: 10,
      authUserId: '1991',
      ordering: {
        amount: SortOrder.ASC,
        categoryId: SortOrder.ASC,
      },
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].children![0].constraints).toEqual({
        OnlyOnePropertieDefined:
          'Only a accept a one of [amount, billDate, payDate, categoryId, paymentMethodId, paymentStatusId, createdAt, updatedAt] defined.',
      });
    });
  });

  it('should be validate the attributes of the GetBillsInputValidationDTO withou errors and with all possible parameters filled.', async () => {
    return runValidate<GetBillsInputValidationDTO>(GetBillsInputValidationDTO, {
      page: 0,
      size: 10,
      authUserId: '1991',
      ordering: {
        amount: SortOrder.ASC,
      },
      searchByDate: {
        payDate: { initialDate: 19999889, finalDate: 9899999 },
      },
      sort: {
        categoryId: '2000',
      },
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the input attributes of the GetBillByIdValidationDTO withou errors', async () => {
    return runValidate<GetBillByIdValidationDTO>(GetBillByIdValidationDTO, {
      id: '1900',
      authUserId: '20000',
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the input attributes of the GetBillByIdValidationDTO with errors when dont passing correctly id.', async () => {
    return runValidate<GetBillByIdValidationDTO>(GetBillByIdValidationDTO, {
      id: undefined as any,
      authUserId: '20000',
    }).then((errors) => {
      expect(errors.length).toEqual(1);
    });
  });

  it('should be validate the input attributes of the CreateBillValidationDTO withou errors', async () => {
    const model: CreateBillValidationDTO = {
      authUserId: '2991',
      userId: '12339',
      personUserId: '1928abc',
      descriptionBill: 'Description to Bill',
      fixedBill: true,
      billDate: 1982828888888,
      payDate: 98398787878,
      payOut: false,
      icon: 'https://wwww.teste-icon.com',
      amount: 7627.89,
      paymentStatusId: '267890',
      paymentStatusDescription: 'paymentStatus',
      categoryId: '267890',
      categoryDescription: 'category',
      paymentMethodId: '267890',
      paymentMethodDescription: 'paymentMethod',
      isPaymentCardBill: true,
      invoiceCarData: { invoiceCardId: '18287287', paymentCardId: '65762783' },
      isShoppingListBill: true,
      shoppingListData: { shoppingListId: '571621111' },
    };
    return runValidate<CreateBillValidationDTO>(
      CreateBillValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the icon input attribute with not url.', async () => {
    const model: CreateBillValidationDTO = {
      authUserId: '2991',
      userId: '12339',
      personUserId: '1928abc',
      descriptionBill: 'Description to Bill',
      fixedBill: true,
      billDate: 1982828888888,
      payDate: 98398787878,
      payOut: false,
      icon: 'this-is-not-url',
      amount: 7627.89,
      paymentStatusId: '267890',
      paymentStatusDescription: 'paymentStatus',
      categoryId: '267890',
      categoryDescription: 'category',
      paymentMethodId: '267890',
      paymentMethodDescription: 'paymentMethod',
      isPaymentCardBill: true,
      invoiceCarData: { invoiceCardId: '18287287', paymentCardId: '65762783' },
      isShoppingListBill: true,
      shoppingListData: { shoppingListId: '571621111' },
    };
    return runValidate<CreateBillValidationDTO>(
      CreateBillValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isUrl: 'icon must be a URL address',
      });
    });
  });

  it('should be validate the icon input attribute with null.', async () => {
    const model: CreateBillValidationDTO = {
      authUserId: '2991',
      userId: '12339',
      personUserId: '1928abc',
      descriptionBill: 'Description to Bill',
      fixedBill: true,
      billDate: 1982828888888,
      payDate: 98398787878,
      payOut: false,
      icon: null,
      amount: 7627.89,
      paymentStatusId: '267890',
      paymentStatusDescription: 'paymentStatus',
      categoryId: '267890',
      categoryDescription: 'category',
      paymentMethodId: '267890',
      paymentMethodDescription: 'paymentMethod',
      isPaymentCardBill: true,
      invoiceCarData: { invoiceCardId: '18287287', paymentCardId: '65762783' },
      isShoppingListBill: true,
      shoppingListData: { shoppingListId: '571621111' },
    };
    return runValidate<CreateBillValidationDTO>(
      CreateBillValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the input attributes of the EditBillValidationDTO withou errors.', async () => {
    const model: EditBillValidationDTO = {
      authUserId: '2991',
      id: '122121212121',
      userId: '12339',
      personUserId: '1928abc',
      descriptionBill: 'Description to Bill',
      fixedBill: true,
      billDate: 1982828888888,
      payDate: 98398787878,
      payOut: false,
      icon: null,
      amount: 7627.89,
      paymentStatusId: '267890',
      paymentStatusDescription: 'paymentStatus',
      categoryId: '267890',
      categoryDescription: 'category',
      paymentMethodId: '267890',
      paymentMethodDescription: 'paymentMethod',
      isPaymentCardBill: true,
      invoiceCarData: { invoiceCardId: '18287287', paymentCardId: '65762783' },
      isShoppingListBill: true,
      shoppingListData: { shoppingListId: '571621111' },
      createdAt: 18783929293293,
      updatedAt: 127899999939339,
    };
    return runValidate<EditBillValidationDTO>(
      EditBillValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the updatedAt input attribute with null.', async () => {
    const model: EditBillValidationDTO = {
      authUserId: '2991',
      id: '122121212121',
      userId: '12339',
      personUserId: '1928abc',
      descriptionBill: 'Description to Bill',
      fixedBill: true,
      billDate: 1982828888888,
      payDate: 98398787878,
      payOut: false,
      icon: null,
      amount: 7627.89,
      paymentStatusId: '267890',
      paymentStatusDescription: 'paymentStatus',
      categoryId: '267890',
      categoryDescription: 'category',
      paymentMethodId: '267890',
      paymentMethodDescription: 'paymentMethod',
      isPaymentCardBill: true,
      invoiceCarData: { invoiceCardId: '18287287', paymentCardId: '65762783' },
      isShoppingListBill: true,
      shoppingListData: { shoppingListId: '571621111' },
      createdAt: 18783929293293,
      updatedAt: null,
    };
    return runValidate<EditBillValidationDTO>(
      EditBillValidationDTO,
      model,
    ).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the input attributes of the DeleteBillValidationDTO withou errors', async () => {
    return runValidate<DeleteBillValidationDTO>(DeleteBillValidationDTO, {
      id: '1900',
      authUserId: '20000',
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the input attributes of the GetBillsPayableMonthDTO withou errors', async () => {
    return runValidate<GetBillsPayableMonthDTO>(GetBillsPayableMonthDTO, {
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
