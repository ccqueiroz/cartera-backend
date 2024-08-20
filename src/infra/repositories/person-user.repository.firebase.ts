import firebase from 'firebase';
import { PersonUserGateway } from '@/domain/Person_User/gateway/person_user.gateway';
import { PersonUserEntitieDTO } from '@/domain/Person_User/dtos/person-user.dto';
import { PersonUserEntitie } from '@/domain/Person_User/entitie/person_user.entitie';
import { ErrorsFirebase } from '../database/firebase/errorHandling';

export class PersonUserRepositoryFirebase implements PersonUserGateway {
  private dbCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
  private collection = 'Person_User';
  private constructor(private readonly db: firebase.firestore.Firestore) {
    this.dbCollection = this.db.collection(this.collection);
  }

  public static create(db: firebase.firestore.Firestore) {
    return new PersonUserRepositoryFirebase(db);
  }

  public async getUserByEmail({
    email,
  }: Pick<
    PersonUserEntitieDTO,
    'email'
  >): Promise<PersonUserEntitieDTO | null> {
    const data = await this.dbCollection
      .where('email', '==', email)
      .get()
      .then((response) =>
        response.docs?.map((item) => ({ id: item.id, ...item.data() })),
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    if (!data || data.length === 0) return null;

    const user = data[0] as PersonUserEntitieDTO;

    return PersonUserEntitie.with({
      id: user.id,
      userId: user.userId || '2112',
      name: user.name,
      email: user.email,
      image: user?.image,
    });
  }
}
