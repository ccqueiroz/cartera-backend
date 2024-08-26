import { BaseDto } from '@/domain/dtos/baseDto.dto';
import { PersonUserEntitieDTO } from '@/domain/Person_User/dtos/person-user.dto';

export type AuthEntitieDTO = {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expirationTime: string;
  lastLoginAt: string;
} & Pick<Partial<PersonUserEntitieDTO>, 'firstName' | 'lastName'> &
  BaseDto;

export type AuthSignDTO = {
  password: string;
} & Pick<AuthEntitieDTO, 'email' | 'updatedAt'>;

export type AuthRegisterDTO = AuthSignDTO &
  Required<Pick<AuthEntitieDTO, 'firstName' | 'lastName'>>;
