import type { CookieOptions, Request, Response } from 'express';
import { UnauthorizedError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { RegisterAccountUseCase } from '@/features/auth/application/register-account.usecase';
import { LoginUseCase } from '@/features/auth/application/login.usecase';
import { RefreshSessionUseCase } from '@/features/auth/application/refresh-session.usecase';
import { SignoutUseCase } from '@/features/auth/application/signout.usecase';
import { RecoverPasswordUseCase } from '@/features/auth/application/recover-password.usecase';
import { assertAuthInputValid } from '@/features/auth/infra/http/auth-input.validator';
import { RegisterAccountSchema } from '@/features/auth/infra/http/schemas/register-account.schema';
import { LoginSchema } from '@/features/auth/infra/http/schemas/login.schema';
import { RefreshSessionSchema } from '@/features/auth/infra/http/schemas/refresh-session.schema';
import { RecoverPasswordSchema } from '@/features/auth/infra/http/schemas/recover-password.schema';

const SESSION_COOKIE = 'session';

// Atributos que faltavam no legado — sem eles o cookie vazava pra JS e cross-site.
const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
};

// Anti-enumeração (UC-06): mesma resposta exista a conta ou não.
const RECOVERY_GENERIC_MESSAGE = 'Se o e-mail existir, enviaremos instruções.';

function userIdFrom(req: Request): string {
  const userId = req.user_auth?.userId;
  if (!userId) throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
  return userId;
}

export interface AuthUseCases {
  registerAccount: RegisterAccountUseCase;
  login: LoginUseCase;
  refreshSession: RefreshSessionUseCase;
  signout: SignoutUseCase;
  recoverPassword: RecoverPasswordUseCase;
}

export class AuthController {
  private constructor(private readonly useCases: AuthUseCases) {}

  public static create(useCases: AuthUseCases): AuthController {
    return new AuthController(useCases);
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    await assertAuthInputValid(RegisterAccountSchema, req.body);
    const output = await this.useCases.registerAccount.execute({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });
    res.cookie(SESSION_COOKIE, output.accessToken, SESSION_COOKIE_OPTIONS);
    res.status(201).json(output);
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    await assertAuthInputValid(LoginSchema, req.body);
    const session = await this.useCases.login.execute({
      email: req.body.email,
      password: req.body.password,
    });
    res.cookie(SESSION_COOKIE, session.accessToken, SESSION_COOKIE_OPTIONS);
    res.status(200).json(session);
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    await assertAuthInputValid(RefreshSessionSchema, req.body);
    const session = await this.useCases.refreshSession.execute({
      refreshToken: req.body.refreshToken,
    });
    res.cookie(SESSION_COOKIE, session.accessToken, SESSION_COOKIE_OPTIONS);
    res.status(200).json(session);
  };

  public signout = async (req: Request, res: Response): Promise<void> => {
    await this.useCases.signout.execute({ userId: userIdFrom(req) });
    res.clearCookie(SESSION_COOKIE, SESSION_COOKIE_OPTIONS);
    res.status(204).send();
  };

  public recoverPassword = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    await assertAuthInputValid(RecoverPasswordSchema, req.body);
    await this.useCases.recoverPassword.execute({ email: req.body.email });
    res.status(202).json({ message: RECOVERY_GENERIC_MESSAGE });
  };
}
