import * as admin from 'firebase-admin';
import {
  CategoryDTO,
  GetCategoriesInputDTO,
} from '@/domain/Category/dtos/category.dto';
import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';
import firebase from 'firebase';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { CategoryEntitie } from '@/domain/Category/entitie/category.entitie';
export class CategoryRepositoryFirebase implements CategoryGateway {
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
}
