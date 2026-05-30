export enum DueStatusEnum {
  PAID = 'PAID',
  PENDING = 'PENDING',
  DUE_SOON = 'DUE_SOON',
  OVERDUE = 'OVERDUE',
}

/** Situação de vencimento derivada de data (CLAUDE.md §5). Imutável. */
export class DueStatus {
  private constructor(private readonly _status: DueStatusEnum) {}

  public static calculate(
    dueDate: Date,
    payDay: Date | null,
    today: Date,
    daysForDueSoon = 5,
  ): DueStatus {
    if (payDay) return new DueStatus(DueStatusEnum.PAID);

    // Não muta as datas de entrada (o scaffold antigo usava setHours no input).
    const todayMs = DueStatus.startOfDay(today);
    const dueMs = DueStatus.startOfDay(dueDate);

    if (todayMs > dueMs) return new DueStatus(DueStatusEnum.OVERDUE);

    const diffDays = (dueMs - todayMs) / (1000 * 60 * 60 * 24);
    if (diffDays <= daysForDueSoon)
      return new DueStatus(DueStatusEnum.DUE_SOON);

    return new DueStatus(DueStatusEnum.PENDING);
  }

  private static startOfDay(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  public get status(): DueStatusEnum {
    return this._status;
  }

  public isPaid(): boolean {
    return this._status === DueStatusEnum.PAID;
  }

  public isOverdue(): boolean {
    return this._status === DueStatusEnum.OVERDUE;
  }
}
