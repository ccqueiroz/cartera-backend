import * as admin from 'firebase-admin';
import { PersonUserGateway } from '@/domain/Person_User/gateway/person_user.gateway';
import {
  CreatePersonUserOutputDTO,
  EditPersonUserDTO,
  EditPersonUserOutputDTO,
  PersonUserEntitieDTO,
} from '@/domain/Person_User/dtos/person-user.dto';
import { PersonUserEntitie } from '@/domain/Person_User/entitie/person_user.entitie';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';

export class PersonUserRepositoryFirebase implements PersonUserGateway {
  private static instance: PersonUserRepositoryFirebase;
  private dbCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
  private collection = 'Person_User';
  private constructor(private readonly db: admin.firestore.Firestore) {
    this.dbCollection = this.db.collection(this.collection);
  }

  public static create(db: admin.firestore.Firestore) {
    if (!PersonUserRepositoryFirebase.instance) {
      PersonUserRepositoryFirebase.instance = new PersonUserRepositoryFirebase(
        db,
      );
    }
    return PersonUserRepositoryFirebase.instance;
  }

  public async getPersonUserByEmail({
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
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user?.image,
      createdAt: user?.createdAt,
      fullName: user?.fullName,
      updatedAt: user?.updatedAt,
    });
  }

  public async getPersonUserById({
    id,
  }: Required<
    Pick<PersonUserEntitieDTO, 'id'>
  >): Promise<PersonUserEntitieDTO | null> {
    const personUser = await this.dbCollection
      .doc(id)
      .get()
      .then((response) =>
        response.exists
          ? { id: response.id, ...(response.data() as PersonUserEntitieDTO) }
          : null,
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return personUser ? PersonUserEntitie.with({ ...personUser }) : null;
  }

  public async createPersonUser({
    email,
    userId,
    firstName,
    lastName,
    createdAt,
  }: Pick<
    PersonUserEntitieDTO,
    'email' | 'firstName' | 'lastName' | 'userId' | 'createdAt'
  >): Promise<CreatePersonUserOutputDTO | null> {
    const newUser = PersonUserEntitie.create({
      email,
      userId,
      firstName,
      lastName,
      createdAt,
    });

    const data = await this.dbCollection
      .add({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        userId: newUser.userId,
        createdAt: newUser.createdAt,
      })
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return {
      id: data?.id,
      fullName: newUser.fullName,
    };
  }

  public async editPersonUser({
    personId,
    personData,
  }: EditPersonUserDTO): Promise<EditPersonUserOutputDTO> {
    const updatedAt = new Date().getTime();

    await this.dbCollection
      .doc(personId)
      .update({ ...personData, updatedAt })
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return PersonUserEntitie.with({
      id: personId,
      ...personData,
      updatedAt,
    });
  }

  public async deletePersonUser({
    id,
  }: Required<Pick<PersonUserEntitieDTO, 'id'>>): Promise<void> {
    await this.dbCollection
      .doc(id)
      .delete()
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });
  }
}
