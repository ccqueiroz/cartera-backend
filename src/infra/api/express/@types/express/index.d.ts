import { AuthEntitieDTO } from '../../../../../domain/Auth/dtos/auth.dto';

declare global {
  namespace Express {
    interface Request {
      user_auth?: Pick<AuthEntitieDTO, 'userId' | 'email' | 'expirationTime'>;
      ipControll?: string;
    }
  }
}
