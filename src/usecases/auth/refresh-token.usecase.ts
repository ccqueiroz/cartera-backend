import {
  AuthEntitieDTO,
  AuthRefreshTokenDTO,
} from '@/domain/Auth/dtos/auth.dto';
import { Usecase } from '../usecase';
import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { OutputDTO } from '@/domain/dtos/output.dto';

export type RefreshTokenInputDTO = AuthRefreshTokenDTO;
export type RefreshTokenOutputDTO = OutputDTO<
  Omit<AuthEntitieDTO, 'email' | 'lastLoginAt' | 'createdAt' | 'updatedAt'>
>;

export class RefreshTokenUseCase
  implements Usecase<RefreshTokenInputDTO, RefreshTokenOutputDTO>
{
  private constructor(private readonly authGateway: AuthGateway) {}

  public static create(authGateway: AuthGateway) {
    return new RefreshTokenUseCase(authGateway);
  }

  public async execute({ refreshToken }: RefreshTokenInputDTO) {
    if (!refreshToken) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 403);
    }

    const token = await this.authGateway.refreshToken({
      refreshToken,
    });

    return { data: { ...token } };
  }
}
