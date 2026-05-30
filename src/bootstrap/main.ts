import 'dotenv/config';
import { makeHealthModule } from '@/features/health/health.factory';
import { Route } from '@/shared/http/route';
import { HttpServer } from './http-server';

/**
 * Composition root da reescrita. Único lugar que conhece as factories.
 * Ordem: suporte → consumidores (CLAUDE.md §11). Por ora, só `health`.
 */
function bootstrap(): void {
  const routes: Route[] = [...makeHealthModule()];

  const server = HttpServer.create(routes);
  const port = Number(process.env.PORT) || 8000;
  server.start(port, () => {
    // eslint-disable-next-line no-console
    console.log(`cartera-backend (rewrite) on :${port}`);
  });
}

bootstrap();
