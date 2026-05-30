import { DueStatus, DueStatusEnum } from './due-status.vo';

describe('DueStatus', () => {
  const today = new Date('2026-05-30');

  it('PAID quando há data de pagamento', () => {
    const s = DueStatus.calculate(
      new Date('2026-01-01'),
      new Date('2026-01-05'),
      today,
    );
    expect(s.status).toBe(DueStatusEnum.PAID);
    expect(s.isPaid()).toBe(true);
  });

  it('OVERDUE quando vencido e não pago', () => {
    const s = DueStatus.calculate(new Date('2026-05-01'), null, today);
    expect(s.status).toBe(DueStatusEnum.OVERDUE);
    expect(s.isOverdue()).toBe(true);
  });

  it('DUE_SOON dentro da janela', () => {
    const s = DueStatus.calculate(new Date('2026-06-02'), null, today);
    expect(s.status).toBe(DueStatusEnum.DUE_SOON);
  });

  it('PENDING fora da janela', () => {
    const s = DueStatus.calculate(new Date('2026-07-01'), null, today);
    expect(s.status).toBe(DueStatusEnum.PENDING);
  });

  it('NÃO muta as datas de entrada', () => {
    const due = new Date('2026-06-02');
    const ref = new Date('2026-05-30T13:45:00');
    const dueBefore = due.getTime();
    const refBefore = ref.getTime();
    DueStatus.calculate(due, null, ref);
    expect(due.getTime()).toBe(dueBefore);
    expect(ref.getTime()).toBe(refBefore);
  });
});
