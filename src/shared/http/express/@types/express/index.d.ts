import { SessionUser } from '@/shared/http/express/middlewares/verify-token.middleware';

declare global {
  namespace Express {
    interface Request {
      user_auth?: SessionUser;
      ipControll?: string;
    }
  }
}
