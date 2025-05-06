import {
  GetCategoriesInputDTO,
  CategoryDTO,
} from '../../domain/Category/dtos/category.dto';
import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { CategoryRepositoryGateway } from '@/domain/Category/gateway/category.repository.gateway';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';

export class CategoryService implements CategoryServiceGateway {
  private static instance: CategoryService;
  private keyController = 'category';
  private TTL = 10 * 60; // 10 minutes;

  private constructor(
    private readonly db: CategoryRepositoryGateway,
    private readonly cache: CacheGateway,
  ) {}

  public static create(db: CategoryRepositoryGateway, cache: CacheGateway) {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService(db, cache);
    }

    return CategoryService.instance;
  }

  public async getCategories({
    type,
  }: GetCategoriesInputDTO): Promise<Array<CategoryDTO>> {
    const key = `${this.keyController}-list-all-${type}`;

    const categoriesCache = await this.cache.recover<Array<CategoryDTO>>(key);

    if (Array.isArray(categoriesCache) && categoriesCache.length > 0) {
      return categoriesCache;
    }
    const categoriesDb = await this.db.getCategories({ type });

    if (categoriesDb.length > 0) {
      await this.cache.save<Array<CategoryDTO>>(key, categoriesDb, this.TTL);
    }

    return categoriesDb;
  }

  public async getCategoryById({
    id,
  }: Pick<CategoryDTO, 'id'>): Promise<CategoryDTO | null> {
    const key = `${this.keyController}-list-by-id-${id}`;

    const categoryCache = await this.cache.recover<CategoryDTO>(key);

    if (categoryCache) {
      return categoryCache;
    }

    const category = await this.db.getCategoryById({ id });

    if (category) {
      await this.cache.save<CategoryDTO>(key, category, this.TTL);
    }

    return category;
  }
}
