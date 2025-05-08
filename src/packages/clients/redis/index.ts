import { createClient } from 'redis';

const clientRedis = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST_NAME || 'redis',
    port: +(process.env.REDIS_HOST_PORT || 6379),
    reconnectStrategy: (retries) => {
      const jitter = Math.floor(Math.random() * 200);
      const delay = Math.min(Math.pow(2, retries) * 50, 2000);
      return delay + jitter;
    },
  },
});

export { clientRedis };
