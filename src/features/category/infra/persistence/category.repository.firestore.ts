import { Firestore } from 'firebase-admin/firestore';
import {
  Category,
  CategoryPersistence,
} from '@/features/category/domain/category.entity';
import { CategoryRepository } from '@/features/category/domain/ports/category.repository.port';
import { CategoryDescription } from '@/features/category/domain/enums/category-description.enum';
import { CategoryGroup } from '@/features/category/domain/enums/category-group.enum';
import { CategoryType } from '@/features/category/domain/enums/category-type.enum';

export class CategoryRepositoryFirestore implements CategoryRepository {
  private static readonly COLLECTION = 'Category';

  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): CategoryRepositoryFirestore {
    return new CategoryRepositoryFirestore(db);
  }

  public async findActiveByType(type: CategoryType): Promise<Category[]> {
    const query = await this.collection()
      .where('type', '==', type)
      .where('deletedAt', '==', null)
      .get();
    return query.docs.map((doc) =>
      Category.with(doc.data() as CategoryPersistence),
    );
  }

  public async findActiveByEnum(
    descriptionEnum: CategoryDescription,
  ): Promise<Category | null> {
    const query = await this.collection()
      .where('descriptionEnum', '==', descriptionEnum)
      .where('deletedAt', '==', null)
      .limit(1)
      .get();
    if (query.empty) return null;
    return Category.with(query.docs[0].data() as CategoryPersistence);
  }

  public async findByEnum(
    descriptionEnum: CategoryDescription,
  ): Promise<Category | null> {
    const query = await this.collection()
      .where('descriptionEnum', '==', descriptionEnum)
      .limit(1)
      .get();
    if (query.empty) return null;
    return Category.with(query.docs[0].data() as CategoryPersistence);
  }

  public async listGroupsByType(type: CategoryType): Promise<CategoryGroup[]> {
    const query = await this.collection()
      .where('type', '==', type)
      .where('deletedAt', '==', null)
      .get();
    const groups = new Set<CategoryGroup>();
    query.docs.forEach((doc) => {
      const data = doc.data() as CategoryPersistence;
      groups.add(data.group);
    });
    return [...groups];
  }

  public async findActiveByGroupAndType(
    group: CategoryGroup,
    type: CategoryType,
  ): Promise<Category[]> {
    const query = await this.collection()
      .where('group', '==', group)
      .where('type', '==', type)
      .where('deletedAt', '==', null)
      .get();
    return query.docs.map((doc) =>
      Category.with(doc.data() as CategoryPersistence),
    );
  }

  public async create(category: Category): Promise<void> {
    const data = category.toPersistence();
    await this.collection().doc(data.id).set(data);
  }

  public async update(category: Category): Promise<void> {
    const data = category.toPersistence();
    await this.collection().doc(data.id).set(data);
  }

  public async softDelete(category: Category): Promise<void> {
    const data = category.toPersistence();
    await this.collection().doc(data.id).set(data);
  }

  private collection() {
    return this.db.collection(CategoryRepositoryFirestore.COLLECTION);
  }
}
