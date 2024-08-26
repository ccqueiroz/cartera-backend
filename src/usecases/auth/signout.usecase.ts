import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { Usecase } from '../usecase';
import { AuthEntitieDTO } from '@/domain/Auth/dtos/auth.dto';

export type SignoutInputDTO = Pick<AuthEntitieDTO, 'userId'>;

export type SignoutOutputDTO = void;

export class SignoutUseCase
  implements Usecase<SignoutInputDTO, SignoutOutputDTO>
{
  private constructor(private readonly authGateway: AuthGateway) {}

  public static create(authGateway: AuthGateway) {
    return new SignoutUseCase(authGateway);
  }

  public async execute({ userId }: SignoutInputDTO): Promise<SignoutOutputDTO> {
    await this.authGateway.signout({ userId });
  }
}
