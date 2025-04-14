import { LoggerGateway } from '@/domain/Helpers/gateway/logger.gateway';
import { clientWinston } from '@/packages/clients/winston';

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
