import { mockFirestoreAdd, mockFirestoreGet } from '@/test/mocks/firebase.mock';
import { PersonUserRepositoryFirebase } from './person-user.repository.firebase';
import firebase from 'firebase';
import { PersonUserEntitie } from '@/domain/Person_User/entitie/person_user.entitie';
import { ErrorsFirebase } from '../database/firebase/errorHandling';

describe('Person User Repository Firebase', () => {
  let personUserRepo: PersonUserRepositoryFirebase;

  beforeEach(() => {
    jest.clearAllMocks();
    const dbFirestoreMock = firebase.firestore();
    personUserRepo = PersonUserRepositoryFirebase.create(dbFirestoreMock);
  });

  it('should be return user data if email found', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      docs: [
        {
          id: '123',
          data: () => ({
            email: 'jonh.doe@example.com',
            firstName: 'Jonh',
            lastName: 'Doe',
            userId: 'abc098',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            fullName: 'Jonh Doe',
          }),
        },
      ],
    });

    const result = await personUserRepo.getUserByEmail({
      email: 'jonh.doe@example.com',
    });

    expect(result).toBeInstanceOf(PersonUserEntitie);
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);

    expect(result?.id).toBe('123');
    expect(result?.email).toBe('jonh.doe@example.com');
    expect(result?.firstName).toBe('Jonh');
    expect(result?.lastName).toBe('Doe');
    expect(result?.userId).toBe('abc098');
    expect(result?.createdAt).toEqual(expect.any(String));
    expect(result?.updatedAt).toEqual(expect.any(String));
    expect(result?.fullName).toBe('Jonh Doe');
  });

  it('should be return null if email not found', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      docs: [],
    });

    const result = await personUserRepo.getUserByEmail({
      email: 'jonh.doe@example.com',
    });

    expect(result).not.toBeInstanceOf(PersonUserEntitie);

    expect(result).toBeNull();
  });

  it('should be return throw Error if there is a problem with the getUserByEmail request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreGet.mockRejectedValueOnce(error);

    await expect(
      personUserRepo.getUserByEmail({
        email: 'jonh.doe@example.com',
      }),
    ).rejects.toThrow(error);
  });

  it('should be create a new person user when all parameters are passed correctly', async () => {
    mockFirestoreAdd.mockResolvedValueOnce({ id: '12345' });

    const result = await personUserRepo.createPersonUser({
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt: new Date().toISOString(),
    });

    expect(mockFirestoreAdd).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: '12345', fullName: 'Jonh Doe' });
  });

  it('should be return throw Error if there is a problem with the createPersonUser request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreAdd.mockRejectedValueOnce(error);

    await expect(
      personUserRepo.createPersonUser({
        email: 'jonh.doe@example.com',
        firstName: 'Jonh',
        lastName: 'Doe',
        userId: 'abc098',
        createdAt: new Date().toISOString(),
      }),
    ).rejects.toThrow(error);
  });
});
