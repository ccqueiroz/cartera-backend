import {
  CreatedPerson,
  PersonAccountState,
  PersonGateway,
} from '@/features/auth/domain/ports/person.gateway';
import { CreatePersonUseCase } from '@/features/person/application/create-person.usecase';
import { FindPersonByUserIdIncludingDeletedUseCase } from '@/features/person/application/find-person-by-user-id-including-deleted.usecase';

interface PersonInternalUseCases {
  createPerson: CreatePersonUseCase;
  findPersonByUserIdIncludingDeleted: FindPersonByUserIdIncludingDeletedUseCase;
}

/**
 * Mora no bootstrap (não em features/auth nem features/person): nenhuma das
 * duas pode importar a outra — só o composition root conhece os dois lados.
 */
export class PersonGatewayAdapter implements PersonGateway {
  private constructor(
    private readonly personInternal: PersonInternalUseCases,
  ) {}

  public static create(
    personInternal: PersonInternalUseCases,
  ): PersonGatewayAdapter {
    return new PersonGatewayAdapter(personInternal);
  }

  public async create(input: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<CreatedPerson> {
    const person = await this.personInternal.createPerson.execute(input);
    const output = person.toOutput();
    return {
      id: output.id,
      firstName: output.firstName,
      lastName: output.lastName,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
    };
  }

  public async findByUserIdIncludingDeleted(
    userId: string,
  ): Promise<PersonAccountState | null> {
    const person =
      await this.personInternal.findPersonByUserIdIncludingDeleted.execute({
        userId,
      });
    if (!person) return null;
    return { deletedAt: person.toOutput().deletedAt };
  }
}
