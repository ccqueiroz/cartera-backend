import { Firestore } from 'firebase-admin/firestore';
import {
  Person,
  PersonPersistence,
} from '@/features/person/domain/person.entity';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';

export class PersonRepositoryFirestore implements PersonRepository {
  private static readonly COLLECTION = 'persons';

  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): PersonRepositoryFirestore {
    return new PersonRepositoryFirestore(db);
  }

  public async create(person: Person): Promise<void> {
    const data = person.toPersistence();
    await this.collection().doc(data.id).set(data);
  }

  public async update(person: Person): Promise<void> {
    const data = person.toPersistence();
    await this.collection().doc(data.id).set(data);
  }

  public async findByUserId(userId: string): Promise<Person | null> {
    return this.findActiveBy('userId', userId);
  }

  public async findByEmail(email: string): Promise<Person | null> {
    return this.findActiveBy('email', email);
  }

  public async findByDocument(documentValue: string): Promise<Person | null> {
    return this.findActiveBy('document.value', documentValue);
  }

  public async findByUserIdIncludingDeleted(
    userId: string,
  ): Promise<Person | null> {
    const query = await this.collection()
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (query.empty) return null;
    return Person.with(query.docs[0].data() as PersonPersistence);
  }

  private async findActiveBy(
    field: string,
    value: string,
  ): Promise<Person | null> {
    const query = await this.collection()
      .where(field, '==', value)
      .where('deletedAt', '==', null)
      .limit(1)
      .get();
    if (query.empty) return null;
    return Person.with(query.docs[0].data() as PersonPersistence);
  }

  private collection() {
    return this.db.collection(PersonRepositoryFirestore.COLLECTION);
  }
}
