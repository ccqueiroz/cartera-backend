import 'dotenv/config';
import { ApiExpress } from '@/shared/http/express/api.express';
import { makeHealthModule } from '@/features/health/health.factory';
import { makeCategoryModule } from '@/features/category/category.factory';
import { makePaymentMethodModule } from '@/features/payment-method/payment-method.factory';
import { clientFireBaseAdmin } from '@/packages/clients/firebase';
import { WinstonLogger } from '@/shared/logger/winston.logger';
import { RedisCacheRepository } from '@/shared/database/redis/cache.repository.redis';
import { clientRedis } from '@/shared/database/redis/redis.client';
import { CookiesMiddleware } from '@/shared/http/express/middlewares/cookies.middleware';
import { CorsMiddleware } from '@/shared/http/express/middlewares/cors.middleware';
import { IpControllMiddleware } from '@/shared/http/express/middlewares/ip-controll.middleware';
import { NormalizeIpHelper } from '@/shared/http/express/middlewares/normalize-ip';
import { ErrorMiddleware } from '@/shared/http/express/middlewares/error.middleware';
import { SwaggerSetup } from '@/shared/http/swagger/swagger-setup';

/**
 * Composition root da reescrita. Único lugar que conhece as factories e os
 * adapters concretos de `shared/`. Ordem: suporte → consumidores (CLAUDE.md §11).
 */
function main(): void {
  const logger = new WinstonLogger();
  const cache = RedisCacheRepository.create(clientRedis, logger);

  const cookies = new CookiesMiddleware();
  const cors = CorsMiddleware.create();
  const ipControll = new IpControllMiddleware(new NormalizeIpHelper());
  const errorMiddleware = ErrorMiddleware.create(logger);
  const swaggerSetup = SwaggerSetup.create();

  const db = clientFireBaseAdmin.firestore();
  const category = makeCategoryModule({ db });
  const paymentMethod = makePaymentMethodModule({ db });

  const api = ApiExpress.create({
    routes: [...makeHealthModule(), ...category.routes, ...paymentMethod],
    globalMiddlewares: [cookies, cors, ipControll],
    errorMiddleware,
    logger,
    cache,
    swaggerSetup,
  });

  const port = Number(process.env.PORT) || 8000;
  void api.start(port);
}

main();
