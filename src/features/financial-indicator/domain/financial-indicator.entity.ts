import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  FinancialIndicatorDescription,
  FinancialIndicatorDescriptionEnum,
} from '@/features/financial-indicator/domain/enums/financial-indicator-description.enum';
import {
  FinancialIndicatorPeriod,
  FinancialIndicatorPeriodEnum,
} from '@/features/financial-indicator/domain/enums/financial-indicator-period.enum';
import {
  FinancialIndicatorRefMonth,
  FinancialIndicatorRefMonthEnum,
} from '@/features/financial-indicator/domain/enums/financial-indicator-ref-month.enum';

interface FinancialIndicatorProps {
  id: string;
  name: string;
  descriptionEnum: FinancialIndicatorDescription;
  period: FinancialIndicatorPeriod;
  aliquota: number;
  fixedRate: number;
  refPeriodMonth: FinancialIndicatorRefMonth | null;
  refPeriodYear: number;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface FinancialIndicatorPersistence {
  id: string;
  name: string;
  descriptionEnum: FinancialIndicatorDescription;
  period: FinancialIndicatorPeriod;
  aliquota: number;
  fixedRate: number;
  refPeriodMonth: FinancialIndicatorRefMonth | null;
  refPeriodYear: number;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface FinancialIndicatorOutput {
  id: string;
  name: string;
  descriptionEnum: FinancialIndicatorDescription;
  period: FinancialIndicatorPeriod;
  aliquota: number;
  fixedRate: number;
  refPeriodMonth: FinancialIndicatorRefMonth | null;
  refPeriodYear: number;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

const DESCRIPTION_ENUMS = new Set<string>(
  Object.values(FinancialIndicatorDescriptionEnum),
);
const PERIOD_ENUMS = new Set<string>(
  Object.values(FinancialIndicatorPeriodEnum),
);
const REF_MONTH_ENUMS = new Set<string>(
  Object.values(FinancialIndicatorRefMonthEnum),
);

/**
 * Taxa/alíquota padronizada global (SELIC, CDI, IPCA, IOF, ...). Não é escopada
 * por usuário; o registro `active === true` é o vigente. Podem coexistir vários
 * documentos do mesmo `descriptionEnum` — distingue o `active` + a competência
 * (`refPeriodMonth`/`refPeriodYear`).
 *
 * Vigência (decisão PO 2026-06-17): `refPeriodYear` é obrigatório; `refPeriodMonth`
 * ausente ⇒ a taxa vale para o ano inteiro, presente ⇒ vale para aquele mês/ano.
 *
 * `aliquota` carrega a parte periódica (lida conforme `period`); `fixedRate`
 * carrega o adicional fixo cobrado uma vez (ex.: o 0,38% do IOF de crédito) e
 * vale 0 quando não há (decisão PO 2026-06-17 — nunca null).
 */
export class FinancialIndicator {
  private constructor(private readonly props: FinancialIndicatorProps) {}

  public static create(input: {
    id: string;
    name: string;
    descriptionEnum: FinancialIndicatorDescription;
    period: FinancialIndicatorPeriod;
    aliquota: number;
    fixedRate?: number;
    refPeriodMonth?: FinancialIndicatorRefMonth | null;
    refPeriodYear: number;
    active: boolean;
    createdAt: string;
  }): FinancialIndicator {
    const props: FinancialIndicatorProps = {
      ...input,
      fixedRate: input.fixedRate ?? 0,
      refPeriodMonth: input.refPeriodMonth ?? null,
      updatedAt: null,
      deletedAt: null,
    };
    FinancialIndicator.validateProps(props);
    return new FinancialIndicator(props);
  }

  public static with(
    persistence: FinancialIndicatorPersistence,
  ): FinancialIndicator {
    return new FinancialIndicator({
      ...persistence,
      fixedRate: persistence.fixedRate ?? 0,
    });
  }

  private static validateProps(props: FinancialIndicatorProps): void {
    if (!DESCRIPTION_ENUMS.has(props.descriptionEnum))
      throw new ValidationError(ErrorCode.VALIDATION_FAILED);
    if (!PERIOD_ENUMS.has(props.period))
      throw new ValidationError(ErrorCode.VALIDATION_FAILED);
    if (
      props.refPeriodMonth !== null &&
      !REF_MONTH_ENUMS.has(props.refPeriodMonth)
    )
      throw new ValidationError(ErrorCode.VALIDATION_FAILED);
    if (!Number.isInteger(props.refPeriodYear))
      throw new ValidationError(ErrorCode.VALIDATION_FAILED);
    if (!Number.isFinite(props.aliquota))
      throw new ValidationError(ErrorCode.MONEY_INVALID_NUMBER);
    if (!Number.isFinite(props.fixedRate))
      throw new ValidationError(ErrorCode.MONEY_INVALID_NUMBER);
  }

  public get aliquota(): number {
    return this.props.aliquota;
  }

  public get fixedRate(): number {
    return this.props.fixedRate;
  }

  /**
   * Alíquota efetiva aplicada (decisão PO 2026-06-17): parte periódica + adicional
   * fixo (`fixedRate` é 0 quando não há). Ex.: IOF crédito PF = 0,0082%/dia +
   * 0,38% = 0,3882%/dia.
   */
  public get aliquotaTotal(): number {
    return Number((this.props.aliquota + this.props.fixedRate).toFixed(6));
  }

  public get descriptionEnum(): FinancialIndicatorDescription {
    return this.props.descriptionEnum;
  }

  public get isActive(): boolean {
    return this.props.active && this.props.deletedAt === null;
  }

  public toPersistence(): FinancialIndicatorPersistence {
    return { ...this.props };
  }

  public toOutput(): FinancialIndicatorOutput {
    return {
      id: this.props.id,
      name: this.props.name,
      descriptionEnum: this.props.descriptionEnum,
      period: this.props.period,
      aliquota: this.props.aliquota,
      fixedRate: this.props.fixedRate,
      refPeriodMonth: this.props.refPeriodMonth,
      refPeriodYear: this.props.refPeriodYear,
      active: this.props.active,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
