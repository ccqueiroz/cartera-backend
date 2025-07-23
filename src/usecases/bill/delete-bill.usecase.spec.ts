import { DeleteBillUseCase } from './delete-bill.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';

let billServiceMock: jest.Mocked<BillServiceGateway>;
let deletebillUseCase: DeleteBillUseCase;

const userIdMock = '1234567d';

describe('DeleteBillUseCase', () => {
  beforeEach(() => {
    billServiceMock = {
      getBillById: jest.fn(),
      deleteBill: jest.fn(),
    } as any;

    deletebillUseCase = DeleteBillUseCase.create({
      billService: billServiceMock,
    });
  });

  it('should be create a instance of the DeleteBillUseCase class when will be use create method.', () => {
    expect(deletebillUseCase).toBeInstanceOf(DeleteBillUseCase);
  });

  it('should delete a bill when a valid ID is provided', async () => {
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
      updatedAt: new Date().getTime(),
    };

    billServiceMock.getBillById.mockResolvedValue({ ...billObject });

    billServiceMock.deleteBill.mockResolvedValue();

    await deletebillUseCase.execute({
      id: billObject.id,
      userId: userIdMock,
    });

    expect(billServiceMock.getBillById).toHaveBeenCalledWith({
      id: billObject.id,
      userId: userIdMock,
    });
    expect(billServiceMock.deleteBill).toHaveBeenCalledWith({
      id: billObject.id,
      userId: userIdMock,
    });
  });

  it('should throw an error if the ID is missing', async () => {
    const error = await deletebillUseCase
      .execute({ id: '', userId: userIdMock })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });
    expect(billServiceMock.getBillById).not.toHaveBeenCalled();
    expect(billServiceMock.deleteBill).not.toHaveBeenCalled();
  });

  it('should throw an error if the bill does not exist', async () => {
    const billId = 'non-existent-id';

    billServiceMock.getBillById.mockResolvedValue(null);

    const error = await deletebillUseCase
      .execute({ id: billId, userId: userIdMock })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.BILL_NOT_FOUND,
      statusCode: 404,
    });
    expect(billServiceMock.getBillById).toHaveBeenCalledWith({
      id: billId,
      userId: userIdMock,
    });
    expect(billServiceMock.deleteBill).not.toHaveBeenCalled();
  });

  it('should be throw an error if the userId does not passed', async () => {
    const billId = 'existent-id';

    const error = await deletebillUseCase
      .execute({ id: billId, userId: '' })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(billServiceMock.deleteBill).not.toHaveBeenCalled();
  });
});
