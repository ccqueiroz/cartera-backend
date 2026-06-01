export interface NormalizeIp {
  execute(ip: string): string;
}

export class NormalizeIpHelper implements NormalizeIp {
  execute(ip: string): string {
    return ip?.replace(/::ffff:/g, '');
  }
}
