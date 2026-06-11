import { Money } from '@/shared/kernel/value-objects/money.vo';
import { PaymentStatus } from '@/shared/kernel/value-objects/payment-status.vo';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { TransactionType } from '@/shared/kernel/enums/transaction-type.enum';
import { Period, PeriodEnum } from '@/shared/kernel/enums/period.enum';
import {
  BusinessRuleViolationError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export interface PaymentSnapshot {
  paymentDate: string;
  paidAmount: number;
  paymentMethodDescriptionEnum: string | null;
  paymentVariance: number;
  reversedAt: string;
}

interface TransactionProps {
  id: string;
  parentId: string | null;
  rootId: string;
  userId: string;
  personId: string;
  type: TransactionType;
  amount: Money;
  currentAmount: Money;
  paidAmount: Money;
  dueDate: string;
  paymentDate: string | null;
  paid: boolean;
  paymentStatus: PaymentStatusEnum;
  paymentMethodDescriptionEnum: string | null;
  refMonthDueDate: number;
  refYearDueDate: number;
  refMonthPaymentDate: number | null;
  refYearPaymentDate: number | null;
  totalInterest: number;
  paymentVariance: number;
  paidInstallmentsCount: number;
  firstInstallment: boolean;
  categoryDescriptionEnum: string | null;
  categoryGroup: string | null;
  isFixedCost: boolean;
  period: Period | null;
  frequency: number | null;
  rootIsFixedCost: boolean;
  rootHasInstallments: boolean;
  hasChildren: boolean;
  reversed: boolean;
  paymentHistory: PaymentSnapshot[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface TransactionPersistence {
  id: string;
  parentId: string | null;
  rootId: string;
  userId: string;
  personId: string;
  type: TransactionType;
  amount: number;
  currentAmount: number;
  paidAmount: number;
  dueDate: string;
  paymentDate: string | null;
  paid: boolean;
  paymentStatus: PaymentStatusEnum;
  paymentMethodDescriptionEnum: string | null;
  refMonthDueDate: number;
  refYearDueDate: number;
  refMonthPaymentDate: number | null;
  refYearPaymentDate: number | null;
  totalInterest: number;
  paymentVariance: number;
  paidInstallmentsCount: number;
  firstInstallment: boolean;
  categoryDescriptionEnum: string | null;
  categoryGroup: string | null;
  isFixedCost: boolean;
  period: Period | null;
  frequency: number | null;
  rootIsFixedCost: boolean;
  rootHasInstallments: boolean;
  hasChildren: boolean;
  reversed: boolean;
  paymentHistory: PaymentSnapshot[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface TransactionOutput {
  id: string;
  parentId: string | null;
  rootId: string;
  userId: string;
  personId: string;
  type: TransactionType;
  amount: number;
  currentAmount: number;
  paidAmount: number;
  dueDate: string;
  paymentDate: string | null;
  paid: boolean;
  paymentStatus: PaymentStatusEnum;
  paymentMethodDescriptionEnum: string | null;
  refMonthDueDate: number;
  refYearDueDate: number;
  refMonthPaymentDate: number | null;
  refYearPaymentDate: number | null;
  totalInterest: number;
  paymentVariance: number;
  effectiveRate: number;
  paidInstallmentsCount: number;
  firstInstallment: boolean;
  categoryDescriptionEnum: string | null;
  categoryGroup: string | null;
  isFixedCost: boolean;
  period: Period | null;
  frequency: number | null;
  rootIsFixedCost: boolean;
  rootHasInstallments: boolean;
  hasChildren: boolean;
  reversed: boolean;
  deleted: boolean;
  createdAt: string;
}

export interface CreateTransactionInput {
  id: string;
  parentId: string | null;
  rootId: string;
  userId: string;
  personId: string;
  type: TransactionType;
  amount: Money;
  dueDate: string;
  createdAt: string;
  firstInstallment?: boolean;
  hasChildren?: boolean;
  categoryDescriptionEnum?: string | null;
  categoryGroup?: string | null;
  isFixedCost?: boolean;
  period?: Period | null;
  frequency?: number | null;
  rootIsFixedCost?: boolean;
  rootHasInstallments?: boolean;
  paymentDate?: string | null;
  paidAmount?: Money | null;
  paymentMethodDescriptionEnum?: string | null;
}

export interface SettleInput {
  paymentDate: string;
  paidAmount: Money;
  paymentMethodDescriptionEnum: string;
  updatedAt: string;
  today?: Date;
}

export interface EditInput {
  amount?: Money;
  dueDate?: string;
  categoryDescriptionEnum?: string | null;
  categoryGroup?: string | null;
  updatedAt: string;
  today?: Date;
}

const FIXED_COST_PERIODS: ReadonlySet<string> = new Set([
  PeriodEnum.WEEK,
  PeriodEnum.MONTH,
  PeriodEnum.YEAR,
]);

export class Transaction {
  private constructor(private props: TransactionProps) {}

  public static create(input: CreateTransactionInput): Transaction {
    const bornPaid =
      !!input.paymentDate &&
      !!input.paidAmount &&
      !!input.paymentMethodDescriptionEnum;

    const isFixedCost = input.isFixedCost ?? false;
    const period = input.period ?? null;
    const frequency = input.frequency ?? null;
    const hasChildren = input.hasChildren ?? false;
    const isRoot = input.parentId === null;

    Transaction.validateOwnership(input.userId, input.personId);
    Transaction.validateFixedCost(isFixedCost, period, frequency);

    const dueRef = Transaction.refOf(input.dueDate);
    const paymentRef = bornPaid
      ? Transaction.refOf(input.paymentDate as string)
      : { month: null, year: null };

    const props: TransactionProps = {
      id: input.id,
      parentId: input.parentId,
      rootId: input.rootId,
      userId: input.userId,
      personId: input.personId,
      type: input.type,
      amount: input.amount,
      currentAmount: input.amount,
      paidAmount: bornPaid ? (input.paidAmount as Money) : Money.zero(),
      dueDate: input.dueDate,
      paymentDate: bornPaid ? (input.paymentDate as string) : null,
      paid: bornPaid,
      paymentStatus: PaymentStatusEnum.TO_PAY,
      paymentMethodDescriptionEnum: bornPaid
        ? (input.paymentMethodDescriptionEnum as string)
        : null,
      refMonthDueDate: dueRef.month,
      refYearDueDate: dueRef.year,
      refMonthPaymentDate: paymentRef.month,
      refYearPaymentDate: paymentRef.year,
      totalInterest: 0,
      paymentVariance: bornPaid
        ? Transaction.signedVariance(input.paidAmount as Money, input.amount)
        : 0,
      paidInstallmentsCount: 0,
      firstInstallment: input.firstInstallment ?? false,
      categoryDescriptionEnum: input.categoryDescriptionEnum ?? null,
      categoryGroup: input.categoryGroup ?? null,
      isFixedCost,
      period,
      frequency,
      rootIsFixedCost: input.rootIsFixedCost ?? (isRoot ? isFixedCost : false),
      rootHasInstallments:
        input.rootHasInstallments ?? (isRoot ? hasChildren : false),
      hasChildren,
      reversed: false,
      paymentHistory: [],
      deleted: false,
      createdAt: input.createdAt,
      updatedAt: null,
    };

    const node = new Transaction(props);
    node.recomputeStatus();
    return node;
  }

  public static with(persistence: TransactionPersistence): Transaction {
    return new Transaction({
      ...persistence,
      amount: Money.create(persistence.amount),
      currentAmount: Money.create(persistence.currentAmount),
      paidAmount: Money.create(persistence.paidAmount),
      paymentHistory: [...persistence.paymentHistory],
    });
  }

  /**
   * Reconsolida os rollups do nó a partir das filhas imediatas vivas (não
   * deletadas). Ponto único de verdade do modelo árvore (ADR-04). `totalInterest`
   * (juro contratado) nunca recebe a variação de quitação (D18) — são campos
   * distintos. Sem filhas, volta a comportar-se como folha real.
   */
  public recomputeFromChildren(children: Transaction[], today?: Date): void {
    const live = children.filter((child) => !child.isDeleted);

    if (live.length === 0) {
      this.props.hasChildren = false;
      this.props.currentAmount = this.props.amount;
      this.props.paidInstallmentsCount = 0;
      this.recomputeStatus(today);
      return;
    }

    this.props.hasChildren = true;
    // Carona da denormalização de raiz (R11): só a raiz com filhas marca a árvore
    // como parcelamento, gravado na montagem. Só liga (nunca reseta) — a árvore é
    // imutável pós-criação.
    if (this.props.parentId === null) this.props.rootHasInstallments = true;
    this.props.currentAmount = live.reduce(
      (sum, child) => sum.add(child.props.currentAmount),
      Money.zero(),
    );
    this.props.paidAmount = live.reduce(
      (sum, child) => sum.add(child.props.paidAmount),
      Money.zero(),
    );

    const childrenAmountSum = live.reduce(
      (sum, child) => sum + child.props.amount.value,
      0,
    );
    const childrenInterestSum = live.reduce(
      (sum, child) => sum + child.props.totalInterest,
      0,
    );
    this.props.totalInterest = Transaction.round(
      childrenAmountSum - this.props.amount.value + childrenInterestSum,
    );

    this.props.paymentVariance = Transaction.round(
      live.reduce((sum, child) => sum + child.props.paymentVariance, 0),
    );
    this.props.paidInstallmentsCount = live.filter(
      (child) => child.props.paid,
    ).length;
    this.props.paid = live.every((child) => child.props.paid);
    this.recomputeStatus(today);
  }

  public settle(input: SettleInput): void {
    if (this.props.hasChildren)
      throw new BusinessRuleViolationError(
        ErrorCode.TRANSACTION_SETTLE_ON_INTERNAL,
      );
    if (this.props.paid)
      throw new BusinessRuleViolationError(ErrorCode.TRANSACTION_ALREADY_PAID);

    const paymentRef = Transaction.refOf(input.paymentDate);
    this.props.paid = true;
    this.props.paidAmount = input.paidAmount;
    this.props.paymentDate = input.paymentDate;
    this.props.paymentMethodDescriptionEnum =
      input.paymentMethodDescriptionEnum;
    this.props.refMonthPaymentDate = paymentRef.month;
    this.props.refYearPaymentDate = paymentRef.year;
    this.props.paymentVariance = Transaction.signedVariance(
      input.paidAmount,
      this.props.amount,
    );
    this.props.updatedAt = input.updatedAt;
    this.recomputeStatus(input.today);
  }

  public reverse(reversedAt: string, today?: Date): void {
    if (this.props.hasChildren)
      throw new BusinessRuleViolationError(
        ErrorCode.TRANSACTION_REVERSE_ON_INTERNAL,
      );
    if (this.props.firstInstallment)
      throw new BusinessRuleViolationError(ErrorCode.TRANSACTION_REVERSE_ENTRY);
    if (this.props.reversed)
      throw new BusinessRuleViolationError(
        ErrorCode.TRANSACTION_ALREADY_REVERSED,
      );
    if (!this.props.paid)
      throw new BusinessRuleViolationError(
        ErrorCode.TRANSACTION_REVERSE_NOT_PAID,
      );

    this.props.paymentHistory.push({
      paymentDate: this.props.paymentDate as string,
      paidAmount: this.props.paidAmount.value,
      paymentMethodDescriptionEnum: this.props.paymentMethodDescriptionEnum,
      paymentVariance: this.props.paymentVariance,
      reversedAt,
    });

    this.props.paid = false;
    this.props.paidAmount = Money.zero();
    this.props.paymentDate = null;
    this.props.paymentMethodDescriptionEnum = null;
    this.props.paymentVariance = 0;
    this.props.refMonthPaymentDate = null;
    this.props.refYearPaymentDate = null;
    this.props.reversed = true;
    this.props.updatedAt = reversedAt;
    this.recomputeStatus(today);
  }

  /** Edição direta de um nó. `currentAmount` nunca é editável (é rollup). */
  public edit(input: EditInput): void {
    if (input.amount !== undefined) this.props.amount = input.amount;
    if (input.dueDate !== undefined) {
      this.props.dueDate = input.dueDate;
      const ref = Transaction.refOf(input.dueDate);
      this.props.refMonthDueDate = ref.month;
      this.props.refYearDueDate = ref.year;
    }
    if (input.categoryDescriptionEnum !== undefined)
      this.props.categoryDescriptionEnum = input.categoryDescriptionEnum;
    if (input.categoryGroup !== undefined)
      this.props.categoryGroup = input.categoryGroup;
    this.props.updatedAt = input.updatedAt;
    this.recomputeStatus(input.today);
  }

  public softDelete(deletedAt: string): void {
    if (this.props.deleted) return;
    this.props.deleted = true;
    this.props.updatedAt = deletedAt;
  }

  /** Reparcel (modelo): folha não paga vira nó interno; paga é imutável. */
  public markAsInternal(): void {
    if (this.props.paid)
      throw new BusinessRuleViolationError(
        ErrorCode.TRANSACTION_REPARCEL_PAID_LEAF,
      );
    this.props.hasChildren = true;
  }

  private recomputeStatus(today?: Date): void {
    this.props.paymentStatus = PaymentStatus.calculate({
      analysisDate: this.props.dueDate,
      transactionType: this.props.type,
      isPaid: this.props.paid,
      hasOpenChildren: this.props.hasChildren && !this.props.paid,
      today,
    }).status;
  }

  private static validateOwnership(userId: string, personId: string): void {
    if (!userId || !personId)
      throw new ValidationError(ErrorCode.VALIDATION_FAILED, {
        details: 'userId e personId são obrigatórios.',
      });
  }

  private static validateFixedCost(
    isFixedCost: boolean,
    period: Period | null,
    frequency: number | null,
  ): void {
    if (!isFixedCost) {
      if (period !== null || frequency !== null)
        throw new BusinessRuleViolationError(
          ErrorCode.TRANSACTION_INVALID_FIXED_COST,
        );
      return;
    }

    const validPeriod = period !== null && FIXED_COST_PERIODS.has(period);
    const validFrequency =
      frequency !== null &&
      (frequency === -1 || (Number.isInteger(frequency) && frequency >= 2));
    if (!validPeriod || !validFrequency)
      throw new BusinessRuleViolationError(
        ErrorCode.TRANSACTION_INVALID_FIXED_COST,
      );
  }

  private static signedVariance(paid: Money, amount: Money): number {
    return Transaction.round(paid.value - amount.value);
  }

  private static round(value: number): number {
    return Number(value.toFixed(2));
  }

  private static refOf(date: string): { month: number; year: number } {
    const [year, month] = date.split('-');
    return { year: Number(year), month: Number(month) };
  }

  public get id(): string {
    return this.props.id;
  }

  public get parentId(): string | null {
    return this.props.parentId;
  }

  public get rootId(): string {
    return this.props.rootId;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get personId(): string {
    return this.props.personId;
  }

  public get amount(): Money {
    return this.props.amount;
  }

  public get dueDate(): string {
    return this.props.dueDate;
  }

  public get currentAmount(): Money {
    return this.props.currentAmount;
  }

  public get paid(): boolean {
    return this.props.paid;
  }

  public get hasChildren(): boolean {
    return this.props.hasChildren;
  }

  public get firstInstallment(): boolean {
    return this.props.firstInstallment;
  }

  public get isFixedCost(): boolean {
    return this.props.isFixedCost;
  }

  public get reversed(): boolean {
    return this.props.reversed;
  }

  public get isDeleted(): boolean {
    return this.props.deleted;
  }

  public get paymentStatus(): PaymentStatusEnum {
    return this.props.paymentStatus;
  }

  public get paidInstallmentsCount(): number {
    return this.props.paidInstallmentsCount;
  }

  public get createdAt(): string {
    return this.props.createdAt;
  }

  private effectiveRate(): number {
    if (this.props.amount.isZero()) return 0;
    return Number(
      (this.props.paidAmount.value / this.props.amount.value - 1).toFixed(4),
    );
  }

  public toPersistence(): TransactionPersistence {
    return {
      id: this.props.id,
      parentId: this.props.parentId,
      rootId: this.props.rootId,
      userId: this.props.userId,
      personId: this.props.personId,
      type: this.props.type,
      amount: this.props.amount.value,
      currentAmount: this.props.currentAmount.value,
      paidAmount: this.props.paidAmount.value,
      dueDate: this.props.dueDate,
      paymentDate: this.props.paymentDate,
      paid: this.props.paid,
      paymentStatus: this.props.paymentStatus,
      paymentMethodDescriptionEnum: this.props.paymentMethodDescriptionEnum,
      refMonthDueDate: this.props.refMonthDueDate,
      refYearDueDate: this.props.refYearDueDate,
      refMonthPaymentDate: this.props.refMonthPaymentDate,
      refYearPaymentDate: this.props.refYearPaymentDate,
      totalInterest: this.props.totalInterest,
      paymentVariance: this.props.paymentVariance,
      paidInstallmentsCount: this.props.paidInstallmentsCount,
      firstInstallment: this.props.firstInstallment,
      categoryDescriptionEnum: this.props.categoryDescriptionEnum,
      categoryGroup: this.props.categoryGroup,
      isFixedCost: this.props.isFixedCost,
      period: this.props.period,
      frequency: this.props.frequency,
      rootIsFixedCost: this.props.rootIsFixedCost,
      rootHasInstallments: this.props.rootHasInstallments,
      hasChildren: this.props.hasChildren,
      reversed: this.props.reversed,
      paymentHistory: this.props.paymentHistory,
      deleted: this.props.deleted,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }

  public toOutput(): TransactionOutput {
    return {
      id: this.props.id,
      parentId: this.props.parentId,
      rootId: this.props.rootId,
      userId: this.props.userId,
      personId: this.props.personId,
      type: this.props.type,
      amount: this.props.amount.value,
      currentAmount: this.props.currentAmount.value,
      paidAmount: this.props.paidAmount.value,
      dueDate: this.props.dueDate,
      paymentDate: this.props.paymentDate,
      paid: this.props.paid,
      paymentStatus: this.props.paymentStatus,
      paymentMethodDescriptionEnum: this.props.paymentMethodDescriptionEnum,
      refMonthDueDate: this.props.refMonthDueDate,
      refYearDueDate: this.props.refYearDueDate,
      refMonthPaymentDate: this.props.refMonthPaymentDate,
      refYearPaymentDate: this.props.refYearPaymentDate,
      totalInterest: this.props.totalInterest,
      paymentVariance: this.props.paymentVariance,
      effectiveRate: this.effectiveRate(),
      paidInstallmentsCount: this.props.paidInstallmentsCount,
      firstInstallment: this.props.firstInstallment,
      categoryDescriptionEnum: this.props.categoryDescriptionEnum,
      categoryGroup: this.props.categoryGroup,
      isFixedCost: this.props.isFixedCost,
      period: this.props.period,
      frequency: this.props.frequency,
      rootIsFixedCost: this.props.rootIsFixedCost,
      rootHasInstallments: this.props.rootHasInstallments,
      hasChildren: this.props.hasChildren,
      reversed: this.props.reversed,
      deleted: this.props.deleted,
      createdAt: this.props.createdAt,
    };
  }
}
