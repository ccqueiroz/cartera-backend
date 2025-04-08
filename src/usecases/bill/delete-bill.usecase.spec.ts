import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';
import { DeleteBillUseCase } from './delete-bill.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

let billGatewayMock: jest.Mocked<BillGateway>;
let deletebillUseCase: DeleteBillUseCase;

const userIdMock = '1234567d';

describe('DeleteBillUseCase', () => {
  beforeEach(() => {
    billGatewayMock = {
      getBills: jest.fn(),
      getBillById: jest.fn(),
      createBill: jest.fn(),
      updateBill: jest.fn(),
      deleteBill: jest.fn(),
      billsPayableMonth: jest.fn(),
    };

    deletebillUseCase = DeleteBillUseCase.create({
      billGateway: billGatewayMock,
    });
  });

  it('should be create a instance of the DeleteBillUseCase class when will be use create method.', () => {
    expect(deletebillUseCase).toBeInstanceOf(DeleteBillUseCase);
  });

  it('should delete a bill when a valid ID is provided', async () => {
    const billObject = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Faculdade',
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Educação',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    billGatewayMock.getBillById.mockResolvedValue({ ...billObject });

    billGatewayMock.deleteBill.mockResolvedValue();

    await deletebillUseCase.execute({
      id: billObject.id,
      userId: userIdMock,
    });

    expect(billGatewayMock.getBillById).toHaveBeenCalledWith({
      id: billObject.id,
      userId: userIdMock,
    });
    expect(billGatewayMock.deleteBill).toHaveBeenCalledWith({
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
    expect(billGatewayMock.getBillById).not.toHaveBeenCalled();
    expect(billGatewayMock.deleteBill).not.toHaveBeenCalled();
  });

  it('should throw an error if the bill does not exist', async () => {
    const billId = 'non-existent-id';

    billGatewayMock.getBillById.mockResolvedValue(null);

    const error = await deletebillUseCase
      .execute({ id: billId, userId: userIdMock })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.BILL_NOT_FOUND,
      statusCode: 404,
    });
    expect(billGatewayMock.getBillById).toHaveBeenCalledWith({
      id: billId,
      userId: userIdMock,
    });
    expect(billGatewayMock.deleteBill).not.toHaveBeenCalled();
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

    expect(billGatewayMock.deleteBill).not.toHaveBeenCalled();
  });
});
