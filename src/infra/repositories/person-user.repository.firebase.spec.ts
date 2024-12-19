import {
  mockFirestoreAdd,
  mockFirestoreDelete,
  mockFirestoreGet,
  mockFirestoreUpdate,
} from '@/test/mocks/firebase.mock';
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

  it('should be return user data if email found when this search to be by email', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      docs: [
        {
          id: '123',
          data: () => ({
            email: 'jonh.doe@example.com',
            firstName: 'Jonh',
            lastName: 'Doe',
            userId: 'abc098',
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
            fullName: 'Jonh Doe',
          }),
        },
      ],
    });

    const result = await personUserRepo.getPersonUserByEmail({
      email: 'jonh.doe@example.com',
    });

    expect(result).toBeInstanceOf(PersonUserEntitie);
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);

    expect(result?.id).toBe('123');
    expect(result?.email).toBe('jonh.doe@example.com');
    expect(result?.firstName).toBe('Jonh');
    expect(result?.lastName).toBe('Doe');
    expect(result?.userId).toBe('abc098');
    expect(result?.createdAt).toEqual(expect.any(Number));
    expect(result?.updatedAt).toEqual(expect.any(Number));
    expect(result?.fullName).toBe('Jonh Doe');
  });

  it('should be return null if email not found', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      docs: [],
    });

    const result = await personUserRepo.getPersonUserByEmail({
      email: 'jonh.doe@example.com',
    });

    expect(result).not.toBeInstanceOf(PersonUserEntitie);

    expect(result).toBeNull();
  });

  it('should be return throw Error if there is a problem with the getPersonUserByEmail request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreGet.mockRejectedValueOnce(error);

    await expect(
      personUserRepo.getPersonUserByEmail({
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
      createdAt: new Date().getTime(),
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
        createdAt: new Date().getTime(),
      }),
    ).rejects.toThrow(error);
  });

  it('should be return user data if id found when this search to be by id', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      exists: true,
      id: '123',
      data: () => ({
        email: 'jonh.doe@example.com',
        firstName: 'Jonh',
        lastName: 'Doe',
        userId: 'abc098',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        fullName: 'Jonh Doe',
      }),
    });

    const result = await personUserRepo.getPersonUserById({
      id: '123',
    });

    expect(result).toBeInstanceOf(PersonUserEntitie);
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);

    expect(result?.id).toBe('123');
    expect(result?.email).toBe('jonh.doe@example.com');
    expect(result?.firstName).toBe('Jonh');
    expect(result?.lastName).toBe('Doe');
    expect(result?.userId).toBe('abc098');
    expect(result?.createdAt).toEqual(expect.any(Number));
    expect(result?.updatedAt).toEqual(expect.any(Number));
    expect(result?.fullName).toBe('Jonh Doe');
  });

  it('should be return user null if id not found when this search to be by id', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      exists: false,
      id: null,
      data: () => null,
    });

    const result = await personUserRepo.getPersonUserById({
      id: '123',
    });

    expect(result).not.toBeInstanceOf(PersonUserEntitie);
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('should be return throw Error if there is a problem with the getPersonUserById request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreGet.mockRejectedValueOnce(error);

    await expect(
      personUserRepo.getPersonUserById({
        id: '123',
      }),
    ).rejects.toThrow(error);
  });

  it('should be update a person user when all parameters are passed correctly', async () => {
    mockFirestoreUpdate.mockResolvedValueOnce({});

    const result = await personUserRepo.editPersonUser({
      personId: '1666',
      personData: {
        email: 'jonh.doe@example.com',
        firstName: 'Jonh',
        lastName: 'Doe',
        userId: 'abc098',
        fullName: 'Jonh Doe',
        image: null,
      },
    });

    expect(mockFirestoreUpdate).toHaveBeenCalledTimes(1);
    expect(result?.id).toBe('1666');
    expect(result?.email).toBe('jonh.doe@example.com');
    expect(result?.firstName).toBe('Jonh');
    expect(result?.lastName).toBe('Doe');
    expect(result?.userId).toBe('abc098');
    expect(result?.fullName).toBe('Jonh Doe');
    expect(result?.image).toBeNull();
    expect(result?.updatedAt).toEqual(expect.any(Number));
  });

  it('should be return throw Error if there is a problem with the editPersonUser request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreUpdate.mockRejectedValueOnce(error);

    await expect(
      personUserRepo.editPersonUser({
        personId: '1666',
        personData: {
          email: 'jonh.doe@example.com',
          firstName: 'Jonh',
          lastName: 'Doe',
          userId: 'abc098',
          fullName: 'Jonh Doe',
          image: null,
        },
      }),
    ).rejects.toThrow(error);
  });

  it('should be delete a person user when the id param to past correctly', async () => {
    mockFirestoreDelete.mockResolvedValueOnce({});

    await personUserRepo.deletePersonUser({
      id: '1666',
    });

    expect(mockFirestoreDelete).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the deletePersonUser request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreDelete.mockRejectedValueOnce(error);

    await expect(
      personUserRepo.deletePersonUser({
        id: '1666',
      }),
    ).rejects.toThrow(error);
  });
});
