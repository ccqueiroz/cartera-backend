import { CategoryRepositoryGateway } from '@/domain/Category/gateway/category.repository.gateway';
import { CategoryService } from './category.service';
import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';
import { CategoryDTO } from '@/domain/Category/dtos/category.dto';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';

let dbMock: jest.Mocked<CategoryRepositoryGateway>;
let cacheMock: jest.Mocked<CacheGateway>;

describe('Category Service', () => {
  let categoryService: CategoryService;

  const keyController = 'category';

  beforeEach(() => {
    jest.clearAllMocks();

    dbMock = {
      getCategories: jest.fn(),
      getCategoryById: jest.fn(),
    };

    cacheMock = {
      recover: jest.fn(),
      save: jest.fn(),
    } as any;

    categoryService = CategoryService.create(dbMock, cacheMock);
  });

  afterEach(() => {
    (CategoryService as any).instance = undefined;
  });

  it('should be create a instance of the CategoryService class when will be use create method', () => {
    expect(categoryService).toBeInstanceOf(CategoryService);
  });

  it('should be a verify singleton', () => {
    const newInstanceService = CategoryService.create(dbMock, cacheMock);

    expect(categoryService).toEqual(newInstanceService);
  });

  it('should be call getCategories and return the data from db', async () => {
    const data = [
      {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
        description: 'Restaurante',
        descriptionEnum: CategoryDescriptionEnum.RESTAURANT,
        group: CategoryGroupEnum.FOOD,
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
        description: 'Shopping',
        descriptionEnum: CategoryDescriptionEnum.CLOTHING_ACCESSORIES,
        group: CategoryGroupEnum.SHOPPING,
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
        description: 'Uber',
        descriptionEnum: CategoryDescriptionEnum.UBER,
        group: CategoryGroupEnum.MOBILITY_BY_APP,
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
    ];

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getCategories.mockResolvedValue(data);

    const key = `${keyController}-list-all-${CategoryType.BILLS}`;

    const result = await categoryService.getCategories({
      type: CategoryType.BILLS,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(cacheMock.save).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalledWith(key, data, 600);
    expect(dbMock.getCategories).toHaveBeenCalled();
    expect(dbMock.getCategories).toHaveBeenCalledWith({
      type: CategoryType.BILLS,
    });
    expect(result.length).toEqual(3);
  });

  it('should be call getCategories and return the data from cache', async () => {
    const data = [
      {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
        description: 'Restaurante',
        descriptionEnum: CategoryDescriptionEnum.RESTAURANT,
        group: CategoryGroupEnum.FOOD,
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
        description: 'Shopping',
        descriptionEnum: CategoryDescriptionEnum.CLOTHING_ACCESSORIES,
        group: CategoryGroupEnum.SHOPPING,
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
        description: 'Uber',
        descriptionEnum: CategoryDescriptionEnum.UBER,
        group: CategoryGroupEnum.MOBILITY_BY_APP,
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
    ];

    cacheMock.recover.mockResolvedValue(data);

    const key = `${keyController}-list-all-${CategoryType.BILLS}`;

    const result = await categoryService.getCategories({
      type: CategoryType.BILLS,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(dbMock.getCategories).not.toHaveBeenCalled();
    expect(result.length).toEqual(3);
  });

  it('should be not call the "save" method of the cache provider when dont exist registered key in this provider and the data are provided from db provider and the this are empty list', async () => {
    const data: Array<CategoryDTO> = [];

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getCategories.mockResolvedValue(data);

    const key = `${keyController}-list-all-${CategoryType.BILLS}`;

    const result = await categoryService.getCategories({
      type: CategoryType.BILLS,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getCategories).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.length).toEqual(0);
  });

  it('should be call getCategoryById and return the data from db', async () => {
    const data: CategoryDTO = {
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Restaurante',
      descriptionEnum: CategoryDescriptionEnum.RESTAURANT,
      group: CategoryGroupEnum.FOOD,
      type: CategoryType.BILLS,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getCategoryById.mockResolvedValue(data);

    const key = `${keyController}-list-by-id-${data.id}`;

    const result = await categoryService.getCategoryById({
      id: data.id,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getCategoryById).toHaveBeenCalled();
    expect(dbMock.getCategoryById).toHaveBeenCalledWith({ id: data.id });
    expect(cacheMock.save).toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call getCategoryById and return the data from cache', async () => {
    const data: CategoryDTO = {
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Restaurante',
      descriptionEnum: CategoryDescriptionEnum.RESTAURANT,
      group: CategoryGroupEnum.FOOD,
      type: CategoryType.BILLS,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    cacheMock.recover.mockResolvedValue(data);

    const key = `${keyController}-list-by-id-${data.id}`;

    const result = await categoryService.getCategoryById({
      id: data.id,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getCategoryById).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be not call the "save" method of the cache provider when dont exist registered key in this provider and the data are provided from db provider and the this are null', async () => {
    const data: CategoryDTO = {
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Restaurante',
      descriptionEnum: CategoryDescriptionEnum.RESTAURANT,
      group: CategoryGroupEnum.FOOD,
      type: CategoryType.BILLS,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getCategoryById.mockResolvedValue(null);

    const key = `${keyController}-list-by-id-${data.id}`;

    const result = await categoryService.getCategoryById({
      id: data.id,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getCategoryById).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
