import { Request, Response, NextFunction } from 'express';
import { Middleware } from './middleware';
import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CheckIfIsNecessaryCreateNewTokenGateWay } from '@/domain/Auth/helpers/check-if-is-necessary-create-new-token.gateway';

export class VerifyTokenMiddleware implements Middleware {
  private constructor(
    private readonly authGateway: AuthGateway,
    private readonly checkIfIsNecessaryCreateNewTokenGateway: CheckIfIsNecessaryCreateNewTokenGateWay,
  ) {}

  public static create(
    authGateway: AuthGateway,
    checkIfIsNecessaryCreateNewTokenGateway: CheckIfIsNecessaryCreateNewTokenGateWay,
  ) {
    return new VerifyTokenMiddleware(
      authGateway,
      checkIfIsNecessaryCreateNewTokenGateway,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      const token =
        request.headers.authorization &&
        request.headers.authorization.split(' ')[1];

      if (!token) {
        throw new ApiError(ERROR_MESSAGES.INVALID_TOKEN, 401);
      }

      try {
        const decodeToken = await this.authGateway.verifyToken({
          accessToken: token,
        });

        if (!decodeToken)
          throw new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);

        if (
          decodeToken &&
          !this.checkIfIsNecessaryCreateNewTokenGateway.execute(
            +decodeToken?.expirationTime,
          )
        ) {
          const newToken = await this.authGateway.createNewToken({
            userId: decodeToken.userId,
          });
          response.setHeader('Authorization', `Baerer ${newToken}`);
        }

        request.user_auth = { ...decodeToken };
        next();
      } catch (error) {
        next(new ApiError(ERROR_MESSAGES.INVALID_TOKEN, 401));
      }
    };
  }
}
