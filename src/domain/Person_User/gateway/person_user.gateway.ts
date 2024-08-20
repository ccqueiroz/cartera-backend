import { PersonUserEntitieDTO } from '../dtos/person-user.dto';

export interface PersonUserGateway {
  getUserByEmail({
    email,
  }: Pick<PersonUserEntitieDTO, 'email'>): Promise<PersonUserEntitieDTO | null>;
}
