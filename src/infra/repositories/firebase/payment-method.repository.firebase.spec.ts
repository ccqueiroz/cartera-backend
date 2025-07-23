import { PaymentMethodRepositoryFirebase } from './payment-method.repository.firebase';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { PaymentMethodEntitie } from '@/domain/Payment_Method/entitie/payment-method.entitie';
import { dbFirestore } from '../../database/firebase/firebase.database';
import { firestore } from '@/test/mocks/firebase-admin.mock';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';

describe('Payment Method Repository Firebase', () => {
  let paymentMethodRepo: PaymentMethodRepositoryFirebase;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    jest.clearAllMocks();

    paymentMethodRepo = PaymentMethodRepositoryFirebase.create(dbFirestore);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = 'development';
    PaymentMethodRepositoryFirebase['instance'] = null as any;
  });

  it('should be return Payment Methods list when exist items in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      docs: [
        {
          id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
          data: () => ({
            description: 'Cartão de Crédito',
            descriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
          data: () => ({
            description: 'Cartão de Débito',
            descriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
          data: () => ({
            description: 'Pix',
            descriptionEnum: PaymentMethodDescriptionEnum.PIX,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: 'e6c30985-de80-4d5b-aebd-95e9eb49dc8d',
          data: () => ({
            description: 'Dinheiro',
            descriptionEnum: PaymentMethodDescriptionEnum.CASH,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
      ],
    });

    const result = await paymentMethodRepo.getPaymentMethods();

    result.forEach((i) =>
      expect(i).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          description: expect.any(String),
          descriptionEnum: expect.any(String),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      ),
    );
    expect(firestore.get).toHaveBeenCalledTimes(1);

    expect(result.length).toEqual(4);
    expect(result.shift()).toEqual({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Cartão de Crédito',
      descriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });
  });

  it('should be return Payment Methods empty list when not exist items in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      docs: [],
    });

    const result = await paymentMethodRepo.getPaymentMethods();

    expect(result.length).toEqual(0);
    expect(firestore.get).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the getPaymentMethods request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.get.mockRejectedValueOnce(error);

    await expect(paymentMethodRepo.getPaymentMethods()).rejects.toThrow(error);
  });

  it('should be return Payment Methods by id when exist this item in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      exists: true,
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      data: () => ({
        description: 'Cartão de Crédito',
        descriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      }),
    });

    const result = await paymentMethodRepo.getPaymentMethodById({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(firestore.get).toHaveBeenCalledTimes(1);

    expect(result?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
    expect(result?.description).toBe('Cartão de Crédito');
    expect(result?.descriptionEnum).toBe(
      PaymentMethodDescriptionEnum.CREDIT_CARD,
    );
    expect(result?.createdAt).toEqual(expect.any(Number));
    expect(result?.updatedAt).toEqual(expect.any(Number));
  });

  it('should be return null when provided id param, but this item not exist in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      exists: false,
      id: null,
      data: () => null,
    });

    const result = await paymentMethodRepo.getPaymentMethodById({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result).not.toBeInstanceOf(PaymentMethodEntitie);
    expect(result).toBeNull();
    expect(firestore.get).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the getPaymentMethodById request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.get.mockRejectedValueOnce(error);

    await expect(
      paymentMethodRepo.getPaymentMethodById({
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      }),
    ).rejects.toThrow(error);
  });
});
