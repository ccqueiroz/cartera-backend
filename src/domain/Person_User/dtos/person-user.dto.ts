import { BaseDto } from '@/domain/dtos/baseDto.dto';

export type PersonUserEntitieDTO = {
  id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  image?: string | null;
} & BaseDto;

export type CreatePersonUserDTO = Pick<
  PersonUserEntitieDTO,
  'email' | 'userId' | 'firstName' | 'lastName' | 'createdAt'
>;

export type CreatePersonUserOutputDTO = Pick<
  PersonUserEntitieDTO,
  'id' | 'fullName'
>;

export type EditPersonUserDTO = {
  personId: string;
  personData: PersonUserEntitieDTO;
};

export type EditPersonUserOutputDTO = PersonUserEntitieDTO;
