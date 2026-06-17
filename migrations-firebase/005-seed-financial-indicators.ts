import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { FinancialIndicatorDescriptionEnum } from '../src/features/financial-indicator/domain/enums/financial-indicator-description.enum';
import { FinancialIndicatorPeriodEnum } from '../src/features/financial-indicator/domain/enums/financial-indicator-period.enum';
import { FinancialIndicatorRefMonthEnum } from '../src/features/financial-indicator/domain/enums/financial-indicator-ref-month.enum';

interface IndicatorSeed {
  descriptionEnum: FinancialIndicatorDescriptionEnum;
  name: string;
  period: FinancialIndicatorPeriodEnum;
  aliquota: number;
  fixedRate: number;
  refPeriodMonth: FinancialIndicatorRefMonthEnum | null;
  refPeriodYear: number;
}

/**
 * Snapshot vigente das taxas globais do mercado brasileiro (jun/2026), base de
 * juros, cobranças e rendimentos (decisão PO 2026-06-17). Valores em fração
 * decimal (0,38% ⇒ 0.0038). `aliquota` = parte periódica lida conforme `period`;
 * `fixedRate` = adicional fixo cobrado uma vez (só o IOF de crédito hoje).
 * Vigência: `refPeriodMonth` ausente ⇒ taxa ao ano; presente ⇒ taxa do mês/ano.
 * Um job futuro insere novos documentos por período — o vigente é o `active`.
 */
const indicators: IndicatorSeed[] = [
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.SELIC,
    name: 'SELIC',
    period: FinancialIndicatorPeriodEnum.YEARLY,
    aliquota: 0.145,
    fixedRate: 0,
    refPeriodMonth: null,
    refPeriodYear: 2026,
  },
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.CDI,
    name: 'CDI',
    period: FinancialIndicatorPeriodEnum.YEARLY,
    aliquota: 0.1475,
    fixedRate: 0,
    refPeriodMonth: null,
    refPeriodYear: 2026,
  },
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.IPCA,
    name: 'IPCA',
    period: FinancialIndicatorPeriodEnum.MONTHLY,
    aliquota: 0.0058,
    fixedRate: 0,
    refPeriodMonth: FinancialIndicatorRefMonthEnum.MAI,
    refPeriodYear: 2026,
  },
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.INPC,
    name: 'INPC',
    period: FinancialIndicatorPeriodEnum.MONTHLY,
    aliquota: 0.0065,
    fixedRate: 0,
    refPeriodMonth: FinancialIndicatorRefMonthEnum.MAI,
    refPeriodYear: 2026,
  },
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.IOF_CREDIT_PF,
    name: 'IOF Crédito (PF)',
    period: FinancialIndicatorPeriodEnum.DAILY,
    aliquota: 0.000082,
    fixedRate: 0.0038,
    refPeriodMonth: FinancialIndicatorRefMonthEnum.JUN,
    refPeriodYear: 2026,
  },
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.IOF_CREDIT_PJ,
    name: 'IOF Crédito (PJ)',
    period: FinancialIndicatorPeriodEnum.DAILY,
    aliquota: 0.00041,
    fixedRate: 0.0038,
    refPeriodMonth: FinancialIndicatorRefMonthEnum.JUN,
    refPeriodYear: 2026,
  },
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.IOF_EXCHANGE,
    name: 'IOF Câmbio',
    period: FinancialIndicatorPeriodEnum.DAILY,
    aliquota: 0.011,
    fixedRate: 0,
    refPeriodMonth: FinancialIndicatorRefMonthEnum.JUN,
    refPeriodYear: 2026,
  },
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.IOF_INTERNATIONAL_CARD,
    name: 'IOF Cartão Exterior',
    period: FinancialIndicatorPeriodEnum.DAILY,
    aliquota: 0.035,
    fixedRate: 0,
    refPeriodMonth: FinancialIndicatorRefMonthEnum.JUN,
    refPeriodYear: 2026,
  },
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.LATE_PAYMENT_INTEREST,
    name: 'Juros de Mora',
    period: FinancialIndicatorPeriodEnum.MONTHLY,
    aliquota: 0.01,
    fixedRate: 0,
    refPeriodMonth: FinancialIndicatorRefMonthEnum.JUN,
    refPeriodYear: 2026,
  },
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.LATE_PAYMENT_FINE,
    name: 'Multa de Mora',
    period: FinancialIndicatorPeriodEnum.DAILY,
    aliquota: 0.0033,
    fixedRate: 0,
    refPeriodMonth: FinancialIndicatorRefMonthEnum.JUN,
    refPeriodYear: 2026,
  },
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.CREDIT_CARD_REVOLVING,
    name: 'Juros Rotativo do Cartão de Crédito',
    period: FinancialIndicatorPeriodEnum.YEARLY,
    aliquota: 4.295,
    fixedRate: 0,
    refPeriodMonth: FinancialIndicatorRefMonthEnum.JUN,
    refPeriodYear: 2026,
  },
  {
    descriptionEnum: FinancialIndicatorDescriptionEnum.CREDIT_CARD_INSTALLMENT,
    name: 'Juros Parcelado do Cartão de Crédito',
    period: FinancialIndicatorPeriodEnum.YEARLY,
    aliquota: 1.805,
    fixedRate: 0,
    refPeriodMonth: FinancialIndicatorRefMonthEnum.JUN,
    refPeriodYear: 2026,
  },
];

export default async function (db: admin.firestore.Firestore) {
  const ref = db.collection('Financial_Indicator');

  for (const indicator of indicators) {
    const existing = await ref
      .where('descriptionEnum', '==', indicator.descriptionEnum)
      .where('active', '==', true)
      .where('refPeriodMonth', '==', indicator.refPeriodMonth)
      .where('refPeriodYear', '==', indicator.refPeriodYear)
      .limit(1)
      .get();

    if (!existing.empty) continue;

    const nowIso = new Date().toISOString();
    const id = randomUUID();
    await ref.doc(id).set({
      id,
      name: indicator.name,
      descriptionEnum: indicator.descriptionEnum,
      period: indicator.period,
      aliquota: indicator.aliquota,
      fixedRate: indicator.fixedRate,
      refPeriodMonth: indicator.refPeriodMonth,
      refPeriodYear: indicator.refPeriodYear,
      active: true,
      createdAt: nowIso,
      updatedAt: null,
      deletedAt: null,
    });
  }
}
