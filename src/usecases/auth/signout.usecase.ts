import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/Auth/dtos/auth.dto';

export type SignoutInputDTO = void;

export type SignoutOutputDTO = OutputDTO;

export class SignoutUseCase
  implements Usecase<SignoutInputDTO, SignoutOutputDTO>
{
  private constructor(private readonly authGateway: AuthGateway) {}

  public static create(authGateway: AuthGateway) {
    return new SignoutUseCase(authGateway);
  }

  public async execute(): Promise<SignoutOutputDTO> {
    await this.authGateway.signout();
    return { success: true };
  }
}
