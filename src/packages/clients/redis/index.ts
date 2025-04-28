import { createClient } from 'redis';

const clientRedis = createClient({
  socket: {
    reconnectStrategy: (retries) => {
      const jitter = Math.floor(Math.random() * 200);
      const delay = Math.min(Math.pow(2, retries) * 50, 2000);
      return delay + jitter;
    },
  },
});
type TypeOfClientRedis = typeof clientRedis;

export { clientRedis, TypeOfClientRedis };
