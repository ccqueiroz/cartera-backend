import { OverdraftPolicy } from './overdraft-policy.vo';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

describe('OverdraftPolicy', () => {
  it('builds with defaults (rate 0.08, grace 0) when only a positive limit is given', () => {
    const policy = OverdraftPolicy.create({ limit: 500 });
    expect(policy.toPersistence()).toEqual({
      limit: 500,
      monthlyRate: 0.08,
      graceDays: 0,
      since: null,
    });
  });

  it('requires a positive limit', () => {
    for (const limit of [undefined, 0, -10]) {
      let error: unknown;
      try {
        OverdraftPolicy.create({ limit });
      } catch (caught) {
        error = caught;
      }
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).code).toBe(
        ErrorCode.OVERDRAFT_LIMIT_REQUIRED,
      );
    }
  });

  it('rejects negative rate or grace', () => {
    expect(() =>
      OverdraftPolicy.create({ limit: 100, monthlyRate: -0.01 }),
    ).toThrow(ValidationError);
    expect(() => OverdraftPolicy.create({ limit: 100, graceDays: -1 })).toThrow(
      ValidationError,
    );
  });

  it('opens, restarts and closes the episode', () => {
    const policy = OverdraftPolicy.create({ limit: 100 });
    policy.openEpisode('2026-06-14');
    expect(policy.since).toBe('2026-06-14');
    policy.openEpisode('2026-06-20');
    expect(policy.since).toBe('2026-06-14');
    policy.restartEpisode('2026-06-20');
    expect(policy.since).toBe('2026-06-20');
    policy.closeEpisode();
    expect(policy.since).toBeNull();
  });

  it('reconstructs from persistence', () => {
    const policy = OverdraftPolicy.with({
      limit: 250,
      monthlyRate: 0.05,
      graceDays: 3,
      since: '2026-06-10',
    });
    expect(policy.limit.value).toBe(250);
    expect(policy.monthlyRate).toBe(0.05);
    expect(policy.graceDays).toBe(3);
    expect(policy.since).toBe('2026-06-10');
  });
});
