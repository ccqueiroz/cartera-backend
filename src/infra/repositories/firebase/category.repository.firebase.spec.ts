import { CategoryRepositoryFirebase } from './category.repository.firebase';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { CategoryEntitie } from '@/domain/Category/entitie/category.entitie';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';
import { dbFirestore } from '../../database/firebase/firebase.database';
import { firestore } from '@/test/mocks/firebase-admin.mock';

describe('Category Repository Firebase', () => {
  let categoryRepo: CategoryRepositoryFirebase;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    jest.clearAllMocks();
    categoryRepo = CategoryRepositoryFirebase.create(dbFirestore);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = 'development';
  });

  it('should be return Categories list when exist items in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      docs: [
        {
          id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
          data: () => ({
            description: 'Restaurante',
            type: CategoryType.BILLS,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
          data: () => ({
            description: 'Shopping',
            type: CategoryType.BILLS,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
          data: () => ({
            description: 'App Mobilidade',
            type: CategoryType.BILLS,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: 'e6c30985-de80-4d5b-aebd-95e9eb49dc8d',
          data: () => ({
            description: 'Aluguel e Financiamento Residencial',
            type: CategoryType.BILLS,
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
          type: expect.any(String),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
      ),
    );
    expect(firestore.get).toHaveBeenCalledTimes(1);

    expect(result.length).toEqual(4);
    expect(result.shift()).toEqual({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Restaurante',
      type: CategoryType.BILLS,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });
  });

  it('should be return Categories empty list when not exist items in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      docs: [],
    });

    const result = await categoryRepo.getCategories();

    expect(result.length).toEqual(0);
    expect(firestore.get).toHaveBeenCalledTimes(1);
  });

  it('should be return Categories list with type BILLS when the type param to be receive', async () => {
    firestore.get.mockResolvedValueOnce({
      docs: [
        {
          id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
          data: () => ({
            description: 'Restaurante',
            type: CategoryType.BILLS,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
          data: () => ({
            description: 'Shopping',
            type: CategoryType.BILLS,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
          data: () => ({
            description: 'App Mobilidade',
            type: CategoryType.BILLS,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
        {
          id: 'e6c30985-de80-4d5b-aebd-95e9eb49dc8d',
          data: () => ({
            description: 'Aluguel e Financiamento Residencial',
            type: CategoryType.BILLS,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }),
        },
      ],
    });

    const categoryRepo = {
      getCategories: firestore.get,
    };

    const type = CategoryType.BILLS;
    await categoryRepo.getCategories({ type });

    expect(categoryRepo.getCategories).toHaveBeenCalledWith({ type });
  });

  it('should be return throw Error if there is a problem with the getCategories request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.get.mockRejectedValueOnce(error);

    await expect(categoryRepo.getCategories()).rejects.toThrow(error);
  });

  it('should be return Category by id when exist this item in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      exists: true,
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      data: () => ({
        description: 'App Mobilidade',
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      }),
    });

    const result = await categoryRepo.getCategoryById({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result).toBeInstanceOf(CategoryEntitie);
    expect(firestore.get).toHaveBeenCalledTimes(1);

    expect(result?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
    expect(result?.description).toBe('App Mobilidade');
    expect(result?.type).toBe(CategoryType.BILLS);
    expect(result?.createdAt).toEqual(expect.any(Number));
    expect(result?.updatedAt).toEqual(expect.any(Number));
  });

  it('should be return null when provided id param, but this item not exist in database.', async () => {
    firestore.get.mockResolvedValueOnce({
      exists: false,
      id: null,
      data: () => null,
    });

    const result = await categoryRepo.getCategoryById({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result).not.toBeInstanceOf(CategoryEntitie);
    expect(result).toBeNull();
    expect(firestore.get).toHaveBeenCalledTimes(1);
  });

  it('should be return throw Error if there is a problem with the getCategoryById request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.get.mockRejectedValueOnce(error);

    await expect(
      categoryRepo.getCategoryById({
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      }),
    ).rejects.toThrow(error);
  });
});
