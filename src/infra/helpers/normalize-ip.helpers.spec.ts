import { NormalizeIpHelper } from './normalize-ip.helpers';

describe('NormalizeIpHelper', () => {
  let normalizeIpHelper: NormalizeIpHelper;

  beforeEach(() => {
    normalizeIpHelper = new NormalizeIpHelper();
  });

  it('should return the same string if there is no "::ffff:"', () => {
    const ip = '192.168.1.1';
    const result = normalizeIpHelper.execute(ip);
    expect(result).toBe('192.168.1.1');
  });

  it('should be remove the prefix "::ffff:" when present at the beginning of the IP', () => {
    const ip = '::ffff:192.168.1.1';
    const result = normalizeIpHelper.execute(ip);
    expect(result).toBe('192.168.1.1');
  });

  it('should remove all occurrences of "::ffff:" within the string', () => {
    const ip = '::ffff:192.::ffff:168.1.1';
    const result = normalizeIpHelper.execute(ip);
    expect(result).toBe('192.168.1.1');
  });

  it('should return an empty string if the input is empty', () => {
    const ip = '';
    const result = normalizeIpHelper.execute(ip);
    expect(result).toBe('');
  });

  it('should return undefined if input is undefined', () => {
    const result = normalizeIpHelper.execute(undefined as any);
    expect(result).toBeUndefined();
  });
});
