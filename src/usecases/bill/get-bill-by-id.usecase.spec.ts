import { GetBillByIdUseCase } from './get-bill-by-id.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';

let billServiceMock: jest.Mocked<BillServiceGateway>;
let getBillByIdUseCase: GetBillByIdUseCase;
const userIdMock = '1234567d';

describe('GetBillByIdUseCase', () => {
  beforeEach(() => {
    billServiceMock = {
      getBillById: jest.fn(),
    } as any;

    getBillByIdUseCase = GetBillByIdUseCase.create({
      billService: billServiceMock,
    });
  });

  it('should be create a instance of the GetBillByIdUseCase class when will be use create method.', () => {
    expect(getBillByIdUseCase).toBeInstanceOf(GetBillByIdUseCase);
  });

  it('should throw an error if billId is not provided', async () => {
    const error = await getBillByIdUseCase
      .execute({
        id: '',
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });
    expect(billServiceMock.getBillById).not.toHaveBeenCalled();
  });

  it('should return null if bill is not found', async () => {
    billServiceMock.getBillById.mockResolvedValueOnce(null);

    const result = await getBillByIdUseCase.execute({
      id: 'non-existent-id',
      userId: userIdMock,
    });

    expect(result).toEqual({ data: null });
    expect(billServiceMock.getBillById).toHaveBeenCalledWith({
      id: 'non-existent-id',
      userId: userIdMock,
    });
  });

  it('should return the bill if found', async () => {
    const billObject = {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    billServiceMock.getBillById.mockResolvedValueOnce(billObject);

    const result = await getBillByIdUseCase.execute({
      id: billObject.id,
      userId: userIdMock,
    });

    expect(result.data?.id).toBe(billObject.id);

    expect(billServiceMock.getBillById).toHaveBeenCalledWith({
      id: billObject.id,
      userId: userIdMock,
    });
  });

  it('should handle missing optional fields gracefully', async () => {
    const billObject = {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.0,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    billServiceMock.getBillById.mockResolvedValueOnce(billObject);

    const result = await getBillByIdUseCase.execute({
      id: billObject.id,
      userId: userIdMock,
    });

    expect(result).toEqual({
      data: {
        ...billObject,
        createdAt: expect.any(Number),
      },
    });

    expect(billServiceMock.getBillById).toHaveBeenCalledWith({
      id: billObject.id,
      userId: userIdMock,
    });
  });

  it('should be throw an error if the userId does not passed', async () => {
    const billId = 'existent-id';

    const error = await getBillByIdUseCase
      .execute({ id: billId, userId: '' })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(billServiceMock.getBillById).not.toHaveBeenCalled();
  });

  it('should be return data null when the response of the getBillById repository dont contain id', async () => {
    const billId = 'existent-id';

    billServiceMock.getBillById.mockResolvedValueOnce(null);

    const result = await getBillByIdUseCase.execute({
      id: billId,
      userId: userIdMock,
    });

    expect(result).toEqual({
      data: null,
    });

    expect(billServiceMock.getBillById).toHaveBeenCalledWith({
      id: billId,
      userId: userIdMock,
    });
  });
});
