import {
  CreatePersonUserOutputDTO,
  PersonUserEntitieDTO,
} from '../dtos/person-user.dto';

export interface PersonUserGateway {
  getUserByEmail({
    email,
  }: Pick<PersonUserEntitieDTO, 'email'>): Promise<PersonUserEntitieDTO | null>;

  createPersonUser({
    email,
    userId,
    firstName,
    lastName,
    createdAt,
  }: Pick<
    PersonUserEntitieDTO,
    'email' | 'firstName' | 'lastName' | 'userId' | 'createdAt'
  >): Promise<CreatePersonUserOutputDTO | null>;
}
