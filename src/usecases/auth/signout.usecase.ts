import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { Usecase } from '../usecase';

export type SignoutInputDTO = void;

export type SignoutOutputDTO = void;

export class SignoutUseCase
  implements Usecase<SignoutInputDTO, SignoutOutputDTO>
{
  private constructor(private readonly authGateway: AuthGateway) {}

  public static create(authGateway: AuthGateway) {
    return new SignoutUseCase(authGateway);
  }

  public async execute(): Promise<SignoutOutputDTO> {
    await this.authGateway.signout();
  }
}
