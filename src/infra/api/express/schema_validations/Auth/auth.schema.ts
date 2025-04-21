import {
  IsEmail,
  IsString,
  MinLength,
} from '@/packages/clients/class-validator';

type AuthValidationDTO = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userId: string;
};

class ValidationWithEmail {
  @IsEmail()
  email!: string;

  constructor(data: Required<Pick<AuthValidationDTO, 'email'>>) {
    Object.assign(this, data);
  }
}

export class LoginValidation extends ValidationWithEmail {
  @IsString()
  @MinLength(5)
  password!: string;

  constructor(data: Required<Pick<AuthValidationDTO, 'email' | 'password'>>) {
    super({ email: data.email });
    this.password = data.password;
  }
}

export class RecoveryPasswordValidation extends ValidationWithEmail {
  constructor(data: Required<Pick<AuthValidationDTO, 'email'>>) {
    super(data);
  }
}

export class RegisterValidation extends ValidationWithEmail {
  @IsString()
  @MinLength(5)
  password!: string;

  @IsString()
  @MinLength(5)
  confirmPassword!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  constructor(data: Required<Omit<AuthValidationDTO, 'userId'>>) {
    super({ email: data.email });
    Object.assign(this, data);
  }
}

export class SignoutValidation {
  @IsString()
  userId!: string;

  constructor(data: Required<Pick<AuthValidationDTO, 'userId'>>) {
    Object.assign(this, data);
  }
}
