import { mockFirestoreGet } from '@/test/mocks/firebase.mock';
import { PaymentStatusRepositoryFirebase } from './payment-status.repository.firebase';
import firebase from 'firebase';
import { ErrorsFirebase } from '../database/firebase/errorHandling';
import { PaymentStatusEntitie } from '@/domain/Payment_Status/entitie/payment-status.entitie';

describe('Payment Status Repository Firebase', () => {
  let paymentStatusRepo: PaymentStatusRepositoryFirebase;

  beforeEach(() => {
    jest.clearAllMocks();
    const dbFirestoreMock = firebase.firestore();
    paymentStatusRepo = PaymentStatusRepositoryFirebase.create(dbFirestoreMock);
  });

  it('should be return Payment Status list when exist items in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      docs: [
        {
          id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
          data: () => ({
            description: 'Pago',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        },
        {
          id: '17de6833-1e75-40d3-afc3-3249c4da184f',
          data: () => ({
            description: 'A pagar',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        },
        {
          id: '1902e085-8c3d-4d0b-aee1-9f7db1e5ec52',
          data: () => ({
            description: 'A receber',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        },
        {
          id: '2b8c9278-f5c6-439d-995e-20d30c2871a5',
          data: () => ({
            description: 'Recebido',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        },
      ],
    });

    const result = await paymentStatusRepo.getPaymentStatus();

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
      id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
      description: 'Pago',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('should be return Payment Status empty list when not exist items in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      docs: [],
    });

    const result = await paymentStatusRepo.getPaymentStatus();

    expect(result.length).toEqual(0);
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the getPaymentStatus request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreGet.mockRejectedValueOnce(error);

    await expect(paymentStatusRepo.getPaymentStatus()).rejects.toThrow(error);
  });

  it('should be return Payment Status by id when exist this item in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      exists: true,
      id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
      data: () => ({
        description: 'Pago',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    const result = await paymentStatusRepo.getPaymentStatusById({
      id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
    });

    expect(result).toBeInstanceOf(PaymentStatusEntitie);
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);

    expect(result?.id).toBe('0e8f775d-07c1-4ca1-abea-57157ff173b0');
    expect(result?.description).toBe('Pago');
    expect(result?.createdAt).toEqual(expect.any(String));
    expect(result?.updatedAt).toEqual(expect.any(String));
  });

  it('should be return null when provided id param, but this item not exist in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      exists: false,
      id: null,
      data: () => null,
    });

    const result = await paymentStatusRepo.getPaymentStatusById({
      id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
    });

    expect(result).not.toBeInstanceOf(PaymentStatusEntitie);
    expect(result).toBeNull();
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the getPaymentStatusById request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreGet.mockRejectedValueOnce(error);

    await expect(
      paymentStatusRepo.getPaymentStatusById({
        id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
      }),
    ).rejects.toThrow(error);
  });
});
