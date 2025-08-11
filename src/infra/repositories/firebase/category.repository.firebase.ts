import * as admin from 'firebase-admin';
import {
  CategoryDTO,
  GetCategoriesInputDTO,
} from '@/domain/Category/dtos/category.dto';
import { CategoryRepositoryGateway } from '@/domain/Category/gateway/category.repository.gateway';
import firebase from 'firebase';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { CategoryEntitie } from '@/domain/Category/entitie/category.entitie';
export class CategoryRepositoryFirebase implements CategoryRepositoryGateway {
  private static instance: CategoryRepositoryFirebase;
  private dbCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
  private collection = 'Category';

  private constructor(private readonly db: admin.firestore.Firestore) {
    this.dbCollection = this.db.collection(this.collection);
  }

  public static create(db: admin.firestore.Firestore) {
    if (!CategoryRepositoryFirebase.instance) {
      CategoryRepositoryFirebase.instance = new CategoryRepositoryFirebase(db);
    }
    return new CategoryRepositoryFirebase(db);
  }

  public async getCategories({
    type,
  }: GetCategoriesInputDTO): Promise<Array<CategoryDTO>> {
    let query = this
      .dbCollection as unknown as firebase.firestore.Query<firebase.firestore.DocumentData>;

    if (type) {
      query = query.where('type', '==', type);
    }

    const data = await query
      .orderBy('description', 'asc')
      .get()
      .then((response) =>
        response.docs?.map(
          (item) => ({ id: item.id, ...item.data() } as CategoryDTO),
        ),
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return data as Array<CategoryDTO>;
  }

  public async getCategoryById({
    id,
  }: Pick<CategoryDTO, 'id'>): Promise<CategoryDTO | null> {
    const category = await this.dbCollection
      .doc(id)
      .get()
      .then((response) =>
        response.exists
          ? {
              id: response.id,
              ...(response.data() as Omit<CategoryDTO, 'id'>),
            }
          : null,
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return category ? CategoryEntitie.with({ ...category }) : null;
  }

  public async getCategoryByDescriptionEnum({
    descriptionEnum,
  }: Pick<CategoryDTO, 'descriptionEnum'>): Promise<CategoryDTO | null> {
    const data = await this.dbCollection
      .where('descriptionEnum', '==', descriptionEnum)
      .get()
      .then((response) =>
        response.docs?.map((item) => ({ id: item.id, ...item.data() })),
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    if (!data || data.length === 0) return null;

    const category = CategoryEntitie.with(data[0] as CategoryDTO);

    return {
      id: category.id,
      description: category.description,
      descriptionEnum: category.descriptionEnum,
      group: category.group,
      type: category.type,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  public async getCategoryByGroup({
    group,
  }: Pick<CategoryDTO, 'group'>): Promise<Array<CategoryDTO>> {
    const data = await this.dbCollection
      .where('group', '==', group)
      .get()
      .then((response) =>
        response.docs?.map((item) => ({ id: item.id, ...item.data() })),
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return data as Array<CategoryDTO>;
  }
}
