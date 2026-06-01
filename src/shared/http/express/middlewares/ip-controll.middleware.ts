import { Request, Response, NextFunction } from 'express';
import { HttpMiddleware, Middleware } from '@/shared/http/middleware';
import { NormalizeIp } from '@/shared/http/express/middlewares/normalize-ip';

export class IpControllMiddleware implements Middleware {
  public constructor(private readonly normalizeIp: NormalizeIp) {}

  public getHandler(): HttpMiddleware {
    return async (request: Request, response: Response, next: NextFunction) => {
      const { ip, headers } = request;
      // `cf-connecting-ip` é confiável só atrás do Cloudflare e o servidor NÃO
      // habilita `trust proxy`; por isso o valor é meramente informativo (header
      // de resposta), nunca base para decisão de segurança.
      const ipControll = headers['cf-connecting-ip'] ?? ip;

      request.ipControll = ipControll as string;

      response.set(
        'ip-controll',
        this.normalizeIp.execute(ipControll as string),
      );

      next();
    };
  }
}
