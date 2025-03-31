import { NormalizeIpGateway } from '@/domain/Helpers/gateway/normalize-ip.gateway';
import { Middleware } from './middleware';
import { Request, Response, NextFunction } from 'express';

export class IpControllMiddleware implements Middleware {
  public constructor(private readonly normalizeIp: NormalizeIpGateway) {}

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      const { ip, headers } = request;
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
