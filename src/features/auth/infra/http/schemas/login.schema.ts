import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from '@/packages/clients/class-validator';

export class LoginSchema {
  @IsEmail({}, { message: 'O e-mail informado é inválido.' })
  email!: string;

  @IsString({ message: 'A senha deve ser um texto.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password!: string;
}
