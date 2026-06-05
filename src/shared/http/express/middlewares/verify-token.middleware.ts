import { Request, Response, NextFunction } from 'express';
import { HttpMiddleware, Middleware } from '@/shared/http/middleware';
import { UnauthorizedError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export interface SessionUser {
  userId: string;
  email: string;
}

/**
 * O adapter discrimina a falha lançando DomainError: expirado ⇒ TOKEN_EXPIRED,
 * inválido/revogado ⇒ INVALID_TOKEN, conta desativada ⇒ ForbiddenError.
 */
export interface SessionVerifierGateway {
  verifyToken(input: { accessToken: string }): Promise<SessionUser>;
}

const BEARER_PREFIX = 'Bearer ';

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
        const token = this.extractToken(request);

        if (!token) {
          throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
        }

        const user = await this.sessionVerifier.verifyToken({
          accessToken: token,
        });

        request.user_auth = { userId: user.userId, email: user.email };
        next();
      } catch (error) {
        next(error as Error);
      }
    };
  }

  private extractToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (header?.startsWith(BEARER_PREFIX)) {
      const token = header.slice(BEARER_PREFIX.length).trim();
      if (token) return token;
    }
    return request.cookies?.['session'];
  }
}
