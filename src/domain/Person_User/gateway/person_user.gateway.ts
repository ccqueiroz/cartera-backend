import {
  CreatePersonUserOutputDTO,
  EditPersonUserDTO,
  EditPersonUserOutputDTO,
  PersonUserEntitieDTO,
} from '../dtos/person-user.dto';

export interface PersonUserGateway {
  getPersonUserByEmail({
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

  getPersonUserById({
    id,
  }: Pick<PersonUserEntitieDTO, 'id'>): Promise<PersonUserEntitieDTO | null>;

  editPersonUser({
    personId,
    personData,
  }: EditPersonUserDTO): Promise<EditPersonUserOutputDTO>;

  deletePersonUser({ id }: Pick<PersonUserEntitieDTO, 'id'>): Promise<void>;
}
