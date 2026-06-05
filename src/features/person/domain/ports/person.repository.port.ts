import { Person } from '@/features/person/domain/person.entity';

/**
 * Todos os finders filtram `deletedAt == null`; a única exceção é
 * `findByUserIdIncludingDeleted` (consumo futuro do auth para discriminar
 * conta deletada de conta desabilitada).
 */
export interface PersonRepository {
  create(person: Person): Promise<void>;
  update(person: Person): Promise<void>;
  findByUserId(userId: string): Promise<Person | null>;
  findByEmail(email: string): Promise<Person | null>;
  findByDocument(documentValue: string): Promise<Person | null>;
  findByUserIdIncludingDeleted(userId: string): Promise<Person | null>;
}
