import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsDefined,
} from '@/packages/clients/class-validator';

export class UserIdAuthValidation {
  @IsDefined()
  @IsString()
  @MaxLength(60)
  authUserId!: string;
}

class ValidationWithEmail {
  @IsDefined()
  @IsEmail()
  @MaxLength(50)
  email!: string;
}

export class LoginValidation extends ValidationWithEmail {
  @IsDefined()
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  password!: string;
}

export class RefreshTokenValidation {
  @IsDefined()
  @IsString()
  refreshToken!: string;
}

export class RecoveryPasswordValidation extends ValidationWithEmail {}

export class RegisterValidation extends ValidationWithEmail {
  @IsDefined()
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  password!: string;

  @IsDefined()
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  confirmPassword!: string;

  @IsDefined()
  @IsString()
  @MaxLength(50)
  firstName!: string;

  @IsDefined()
  @IsString()
  @MaxLength(50)
  lastName!: string;
}

export class SignoutValidation {
  @IsDefined()
  @IsString()
  @MaxLength(50)
  userId!: string;
}
