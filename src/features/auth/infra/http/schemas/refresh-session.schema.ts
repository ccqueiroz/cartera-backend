import { IsNotEmpty, IsString } from '@/packages/clients/class-validator';

export class RefreshSessionSchema {
  @IsString({ message: 'O refresh token deve ser um texto.' })
  @IsNotEmpty({ message: 'O refresh token é obrigatório.' })
  refreshToken!: string;
}
