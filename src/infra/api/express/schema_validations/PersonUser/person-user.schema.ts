import {
  IsString,
  IsDefined,
  IsEmail,
  MaxLength,
} from '@/packages/clients/class-validator';

export class EditPersonUserValidationDTO {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  id!: string;

  @IsDefined()
  @IsEmail()
  @MaxLength(50)
  email!: string;

  @IsDefined()
  @IsString()
  @MaxLength(50)
  firstName!: string;

  @IsDefined()
  @IsString()
  @MaxLength(50)
  lastName!: string;

  @IsDefined()
  @IsString()
  @MaxLength(50)
  userId!: string;
}

export class GetPersonUserByUserIdValidationDTO {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  id!: string;
}
