import { PersonUserRepositoryFirebase } from './person-user.repository.firebase';
import { PersonUserEntitie } from '@/domain/Person_User/entitie/person_user.entitie';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { dbFirestore } from '../../database/firebase/firebase.database';
import { firestore } from '@/test/mocks/firebase-admin.mock';

describe('Person User Repository Firebase', () => {
  let personUserRepo: PersonUserRepositoryFirebase;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';

    personUserRepo = PersonUserRepositoryFirebase.create(dbFirestore);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = 'development';
    PersonUserRepositoryFirebase['instance'] = null as any;
  });

  it('should be return user data if email found when this search to be by email', async () => {
    firestore.where().get.mockResolvedValueOnce({
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

    expect(firestore.where().get).toHaveBeenCalledTimes(1);

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
    firestore.where().get.mockResolvedValueOnce({
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

    firestore.where().get.mockRejectedValueOnce(error);

    await expect(
      personUserRepo.getPersonUserByEmail({
        email: 'jonh.doe@example.com',
      }),
    ).rejects.toThrow(error);
  });

  it('should be create a new person user when all parameters are passed correctly', async () => {
    firestore.add.mockResolvedValueOnce({ id: '12345' });

    const result = await personUserRepo.createPersonUser({
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt: new Date().getTime(),
    });

    expect(firestore.add).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: '12345', fullName: 'Jonh Doe' });
  });

  it('should be return throw Error if there is a problem with the createPersonUser request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.add.mockRejectedValueOnce(error);

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
    firestore.doc().get.mockResolvedValueOnce({
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
    expect(firestore.doc().get).toHaveBeenCalledTimes(1);

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
    firestore.doc().get.mockResolvedValueOnce({
      exists: false,
      id: null,
      data: () => null,
    });

    const result = await personUserRepo.getPersonUserById({
      id: '123',
    });

    expect(result).not.toBeInstanceOf(PersonUserEntitie);
    expect(firestore.doc().get).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('should be return throw Error if there is a problem with the getPersonUserById request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.doc().get.mockRejectedValueOnce(error);

    await expect(
      personUserRepo.getPersonUserById({
        id: '123',
      }),
    ).rejects.toThrow(error);
  });

  it('should be update a person user when all parameters are passed correctly', async () => {
    firestore.doc().update.mockResolvedValueOnce({});

    const result = await personUserRepo.editPersonUser({
      personId: '1666',
      personData: {
        email: 'jonh.doe@example.com',
        firstName: 'Jonh',
        lastName: 'Doe',
        userId: 'abc098',
        fullName: 'Jonh Doe',
        image: null,
        createdAt: 12121212,
        updatedAt: null,
      },
    });

    expect(firestore.doc().update).toHaveBeenCalledTimes(1);
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

    firestore.doc().update.mockRejectedValueOnce(error);

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
          createdAt: 12121212,
          updatedAt: null,
        },
      }),
    ).rejects.toThrow(error);
  });

  it('should be delete a person user when the id param to past correctly', async () => {
    firestore.doc().delete.mockResolvedValueOnce({});

    await personUserRepo.deletePersonUser({
      id: '1666',
    });

    expect(firestore.doc().delete).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the deletePersonUser request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.doc().delete.mockRejectedValueOnce(error);

    await expect(
      personUserRepo.deletePersonUser({
        id: '1666',
      }),
    ).rejects.toThrow(error);
  });
});
