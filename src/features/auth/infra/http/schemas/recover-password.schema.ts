import { IsEmail } from '@/packages/clients/class-validator';

export class RecoverPasswordSchema {
  @IsEmail({}, { message: 'O e-mail informado é inválido.' })
  email!: string;
}
