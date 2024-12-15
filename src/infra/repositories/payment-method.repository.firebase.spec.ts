import { mockFirestoreGet } from '@/test/mocks/firebase.mock';
import { PaymentMethodRepositoryFirebase } from './payment-method.repository.firebase';
import firebase from 'firebase';
import { ErrorsFirebase } from '../database/firebase/errorHandling';
import { PaymentMethodEntitie } from '@/domain/Payment_Method/entitie/payment-method.entitie';

describe('Payment Method Repository Firebase', () => {
  let paymentMethodRepo: PaymentMethodRepositoryFirebase;

  beforeEach(() => {
    jest.clearAllMocks();
    const dbFirestoreMock = firebase.firestore();
    paymentMethodRepo = PaymentMethodRepositoryFirebase.create(dbFirestoreMock);
  });

  it('should be return Payment Methods list when exist items in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      docs: [
        {
          id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
          data: () => ({
            description: 'Cartão de crédito',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        },
        {
          id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
          data: () => ({
            description: 'Cartão de débito',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        },
        {
          id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
          data: () => ({
            description: 'Pix',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        },
        {
          id: 'e6c30985-de80-4d5b-aebd-95e9eb49dc8d',
          data: () => ({
            description: 'Dinheiro',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ),
    );
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);

    expect(result.length).toEqual(4);
    expect(result.shift()).toEqual({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Cartão de crédito',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('should be return Payment Methods empty list when not exist items in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      docs: [],
    });

    const result = await paymentMethodRepo.getPaymentMethods();

    expect(result.length).toEqual(0);
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the getPaymentMethods request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreGet.mockRejectedValueOnce(error);

    await expect(paymentMethodRepo.getPaymentMethods()).rejects.toThrow(error);
  });

  it('should be return Payment Methods by id when exist this item in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      exists: true,
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      data: () => ({
        description: 'Cartão de crédito',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    const result = await paymentMethodRepo.getPaymentMethodById({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result).toBeInstanceOf(PaymentMethodEntitie);
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);

    expect(result?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
    expect(result?.description).toBe('Cartão de crédito');
    expect(result?.createdAt).toEqual(expect.any(String));
    expect(result?.updatedAt).toEqual(expect.any(String));
  });

  it('should be return null when provided id param, but this item not exist in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      exists: false,
      id: null,
      data: () => null,
    });

    const result = await paymentMethodRepo.getPaymentMethodById({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result).not.toBeInstanceOf(PaymentMethodEntitie);
    expect(result).toBeNull();
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the getPaymentMethodById request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreGet.mockRejectedValueOnce(error);

    await expect(
      paymentMethodRepo.getPaymentMethodById({
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      }),
    ).rejects.toThrow(error);
  });
});
