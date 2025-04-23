import { clientWinston } from '@/packages/clients/winston';
import { WinstonLogger } from './logger.log.winston';

jest.mock('@/packages/clients/winston', () => ({
  clientWinston: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('WinstonLogger', () => {
  let logger: WinstonLogger;

  beforeEach(() => {
    logger = new WinstonLogger();
    jest.clearAllMocks();
  });

  it('should call clientWinston.info with the correct message', () => {
    const message = 'Test info log';
    logger.info(message);
    expect(clientWinston.info).toHaveBeenCalledWith(message);
  });

  it('should call clientWinston.error with the correct message', () => {
    const message = 'Test error log';
    logger.error(message);
    expect(clientWinston.error).toHaveBeenCalledWith(message);
  });

  it('should call clientWinston.warn with the correct message', () => {
    const message = 'Test warn log';
    logger.warn(message);
    expect(clientWinston.warn).toHaveBeenCalledWith(message);
  });

  it('should call clientWinston.debug with the correct message', () => {
    const message = 'Test debug log';
    logger.debug(message);
    expect(clientWinston.debug).toHaveBeenCalledWith(message);
  });
});
