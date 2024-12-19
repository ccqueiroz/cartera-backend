import { mockFirestoreGet } from '@/test/mocks/firebase.mock';
import { CategoryRepositoryFirebase } from './category.repository.firebase';
import firebase from 'firebase';
import { ErrorsFirebase } from '../database/firebase/errorHandling';
import { CategoryEntitie } from '@/domain/Category/entitie/category.entitie';

describe('Category Repository Firebase', () => {
  let categoryRepo: CategoryRepositoryFirebase;

  beforeEach(() => {
    jest.clearAllMocks();
    const dbFirestoreMock = firebase.firestore();
    categoryRepo = CategoryRepositoryFirebase.create(dbFirestoreMock);
  });

  it('should be return Categories list when exist items in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      docs: [
        {
          id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
          data: () => ({
            description: 'Restaurante',
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
          data: () => ({
            description: 'Shopping',
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
          data: () => ({
            description: 'App Mobilidade',
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: 'e6c30985-de80-4d5b-aebd-95e9eb49dc8d',
          data: () => ({
            description: 'Aluguel e Financiamento Residencial',
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
      ],
    });

    const result = await categoryRepo.getCategories();

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
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);

    expect(result.length).toEqual(4);
    expect(result.shift()).toEqual({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Restaurante',
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });
  });

  it('should be return Categories empty list when not exist items in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      docs: [],
    });

    const result = await categoryRepo.getCategories();

    expect(result.length).toEqual(0);
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the getCategories request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreGet.mockRejectedValueOnce(error);

    await expect(categoryRepo.getCategories()).rejects.toThrow(error);
  });

  it('should be return Category by id when exist this item in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      exists: true,
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      data: () => ({
        description: 'App Mobilidade',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      }),
    });

    const result = await categoryRepo.getCategoryById({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result).toBeInstanceOf(CategoryEntitie);
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);

    expect(result?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
    expect(result?.description).toBe('App Mobilidade');
    expect(result?.createdAt).toEqual(expect.any(Number));
    expect(result?.updatedAt).toEqual(expect.any(Number));
  });

  it('should be return null when provided id param, but this item not exist in database.', async () => {
    mockFirestoreGet.mockResolvedValueOnce({
      exists: false,
      id: null,
      data: () => null,
    });

    const result = await categoryRepo.getCategoryById({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result).not.toBeInstanceOf(CategoryEntitie);
    expect(result).toBeNull();
    expect(mockFirestoreGet).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the getCategoryById request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    mockFirestoreGet.mockRejectedValueOnce(error);

    await expect(
      categoryRepo.getCategoryById({
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      }),
    ).rejects.toThrow(error);
  });
});
