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

  private extractToken(request: Request): string | null {
    return request.headers.authorization?.split(' ')[1] || null;
  }

  private handleError(error: unknown, next: NextFunction): void {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500));
    }
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const token = this.extractToken(request);

        if (!token) {
          throw new ApiError(ERROR_MESSAGES.INVALID_TOKEN, 401);
        }

        const decodeToken = await this.authGateway.verifyToken({
          accessToken: token,
        });

        if (!decodeToken)
          throw new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);

        if (
          decodeToken &&
          decodeToken?.expirationTime &&
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
        this.handleError(error, next);
      }
    };
  }
}
