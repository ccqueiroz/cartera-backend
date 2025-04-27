import { PaymentStatusRepositoryFirebase } from './payment-status.repository.firebase';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { PaymentStatusEntitie } from '@/domain/Payment_Status/entitie/payment-status.entitie';
import { dbFirestore } from '../../database/firebase/firebase.database';
import { firestore } from '@/test/mocks/firebase-admin.mock';

describe('Payment Status Repository Firebase', () => {
  let paymentStatusRepo: PaymentStatusRepositoryFirebase;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';

    paymentStatusRepo = PaymentStatusRepositoryFirebase.create(dbFirestore);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = 'development';
  });

  it('should be return Payment Status list when exist items in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      docs: [
        {
          id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
          data: () => ({
            description: 'Pago',
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: '17de6833-1e75-40d3-afc3-3249c4da184f',
          data: () => ({
            description: 'A pagar',
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: '1902e085-8c3d-4d0b-aee1-9f7db1e5ec52',
          data: () => ({
            description: 'A receber',
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: '2b8c9278-f5c6-439d-995e-20d30c2871a5',
          data: () => ({
            description: 'Recebido',
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
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
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      ),
    );
    expect(firestore.get).toHaveBeenCalledTimes(1);

    expect(result.length).toEqual(4);
    expect(result.shift()).toEqual({
      id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
      description: 'Pago',
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });
  });

  it('should be return Payment Status empty list when not exist items in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      docs: [],
    });

    const result = await paymentStatusRepo.getPaymentStatus();

    expect(result.length).toEqual(0);
    expect(firestore.get).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the getPaymentStatus request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.get.mockRejectedValueOnce(error);

    await expect(paymentStatusRepo.getPaymentStatus()).rejects.toThrow(error);
  });

  it('should be return Payment Status by id when exist this item in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      exists: true,
      id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
      data: () => ({
        description: 'Pago',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      }),
    });

    const result = await paymentStatusRepo.getPaymentStatusById({
      id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
    });

    expect(result).toBeInstanceOf(PaymentStatusEntitie);
    expect(firestore.get).toHaveBeenCalledTimes(1);

    expect(result?.id).toBe('0e8f775d-07c1-4ca1-abea-57157ff173b0');
    expect(result?.description).toBe('Pago');
    expect(result?.createdAt).toEqual(expect.any(Number));
    expect(result?.updatedAt).toEqual(expect.any(Number));
  });

  it('should be return null when provided id param, but this item not exist in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      exists: false,
      id: null,
      data: () => null,
    });

    const result = await paymentStatusRepo.getPaymentStatusById({
      id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
    });

    expect(result).not.toBeInstanceOf(PaymentStatusEntitie);
    expect(result).toBeNull();
    expect(firestore.get).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the getPaymentStatusById request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.get.mockRejectedValueOnce(error);

    await expect(
      paymentStatusRepo.getPaymentStatusById({
        id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
      }),
    ).rejects.toThrow(error);
  });
});
