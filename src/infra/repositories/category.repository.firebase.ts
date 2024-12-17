import { CategoryDTO } from '@/domain/Category/dtos/category.dto';
import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';
import firebase from 'firebase';
import { ErrorsFirebase } from '../database/firebase/errorHandling';
import { CategoryEntitie } from '@/domain/Category/entitie/category.entitie';

export class CategoryRepositoryFirebase implements CategoryGateway {
  private dbCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
  private collection = 'Category';

  private constructor(private readonly db: firebase.firestore.Firestore) {
    this.dbCollection = this.db.collection(this.collection);
  }

  public static create(db: firebase.firestore.Firestore) {
    return new CategoryRepositoryFirebase(db);
  }

  public async getCategories(): Promise<Array<CategoryDTO>> {
    const data = await this.dbCollection
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