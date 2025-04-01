import { NormalizeIpGateway } from '@/domain/Helpers/gateway/normalize-ip.gateway';

export class NormalizeIpHelper implements NormalizeIpGateway {
  execute(ip: string) {
    return ip?.replace(/::ffff:/g, '');
  }
}
