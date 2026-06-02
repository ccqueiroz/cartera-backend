import { Request, Response, NextFunction } from 'express';
import { HttpMiddleware, Middleware } from '@/shared/http/middleware';
import { UnauthorizedError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export interface SessionUser {
  userId: string;
  email: string;
  expirationTime?: number;
}

export interface SessionVerifierGateway {
  verifyToken(input: { accessToken: string }): Promise<SessionUser | null>;
}

export class VerifyTokenMiddleware implements Middleware {
  private constructor(
    private readonly sessionVerifier: SessionVerifierGateway,
  ) {}

  public static create(
    sessionVerifier: SessionVerifierGateway,
  ): VerifyTokenMiddleware {
    return new VerifyTokenMiddleware(sessionVerifier);
  }

  public getHandler(): HttpMiddleware {
    return async (
      request: Request,
      _response: Response,
      next: NextFunction,
    ) => {
      try {
        const token = request.cookies?.['session'];

        if (!token) {
          throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
        }

        const decoded = await this.sessionVerifier.verifyToken({
          accessToken: token,
        });

        if (!decoded) {
          throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
        }

        request.user_auth = { ...decoded };
        next();
      } catch (error) {
        next(error as Error);
      }
    };
  }
}
