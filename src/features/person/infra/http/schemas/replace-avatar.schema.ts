import { IsNotEmpty, IsString } from 'class-validator';

export class ReplaceAvatarSchema {
  @IsString({ message: 'A imagem deve ser enviada como base64.' })
  @IsNotEmpty({ message: 'A imagem é obrigatória.' })
  image!: string;
}
