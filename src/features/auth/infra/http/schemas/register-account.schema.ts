import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from '@/packages/clients/class-validator';

export class RegisterAccountSchema {
  @IsEmail({}, { message: 'O e-mail informado é inválido.' })
  email!: string;

  @IsString({ message: 'A senha deve ser um texto.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  // Regra dura do Firebase Auth: senha < 6 caracteres é rejeitada pelo provider.
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  password!: string;

  @IsString({ message: 'O primeiro nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O primeiro nome é obrigatório.' })
  firstName!: string;

  @IsString({ message: 'O sobrenome deve ser um texto.' })
  @IsNotEmpty({ message: 'O sobrenome é obrigatório.' })
  lastName!: string;
}
