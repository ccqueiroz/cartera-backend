import { clientWinston } from '@/packages/clients/winston';
import { LoggerGateway } from '@/shared/logger/logger.gateway';

export class WinstonLogger implements LoggerGateway {
  info(message: string): void {
    clientWinston.info(message);
  }

  error(message: string): void {
    clientWinston.error(message);
  }

  warn(message: string): void {
    clientWinston.warn(message);
  }

  debug(message: string): void {
    clientWinston.debug(message);
  }
}
