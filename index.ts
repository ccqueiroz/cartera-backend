import 'dotenv/config';
import { RedisCacheRepository } from './src/infra/repositories/reddis/cache.repository.redis';
import { clientRedis } from './src/packages/clients/redis';
import { IpControllMiddleware } from './src/infra/api/express/middlewares/ip-controll.middleware';
import { CorsMiddleware } from './src/infra/api/express/middlewares/cors.middleware';
import { normalizeIp } from './src/infra/helpers';
import { ErrorMiddleware } from './src/infra/api/express/middlewares/error.middleware';
import { ApiExpress } from '@/shared/http/express/api.express';
import { logger } from './src/infra/logger';
import { CookiesMiddleware } from '@/infra/api/express/middlewares/cookies.middleware';
import { makeHealthModule } from '@/features/health/health.factory';

function main() {
  const redisCacheRepository = RedisCacheRepository.create(clientRedis, logger);

  const cors = new CorsMiddleware();
  const ipControll = new IpControllMiddleware(normalizeIp);
  const cookies = new CookiesMiddleware();
  const errorMiddleware = new ErrorMiddleware(logger.error);

  const api = ApiExpress.create({
    routes: makeHealthModule(),
    globalMiddlewares: [cookies, cors, ipControll],
    errorMiddleware,
    logger,
    cache: redisCacheRepository,
  });

  const port = Number(process.env.PORT) || 8000;
  api.start(port);
}

main();
