import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { PaymentStatusEnum } from '../src/shared/kernel/enums/payment-status.enum';

const paymentStatuses: { code: PaymentStatusEnum; label: string }[] = [
  { code: PaymentStatusEnum.PAID, label: 'Pago' },
  { code: PaymentStatusEnum.RECEIVED, label: 'Recebido' },
  { code: PaymentStatusEnum.TO_PAY, label: 'A pagar' },
  { code: PaymentStatusEnum.TO_RECEIVE, label: 'A receber' },
  { code: PaymentStatusEnum.DUE_SOON, label: 'A vencer' },
  { code: PaymentStatusEnum.DUE_DAY, label: 'Vence hoje' },
  { code: PaymentStatusEnum.OVERDUE, label: 'Vencido' },
];

export default async function (db: admin.firestore.Firestore) {
  const paymentStatusRef = db.collection('Payment_Status');

  for (const status of paymentStatuses) {
    const existing = await paymentStatusRef
      .where('code', '==', status.code)
      .limit(1)
      .get();

    const nowIso = new Date().toISOString();

    if (!existing.empty) {
      const doc = existing.docs[0];
      const data = doc.data();
      await doc.ref.set({
        id: data.id,
        code: status.code,
        label: status.label,
        createdAt: data.createdAt ?? nowIso,
      });
      continue;
    }

    const id = randomUUID();
    await paymentStatusRef.doc(id).set({
      id,
      code: status.code,
      label: status.label,
      createdAt: nowIso,
    });
  }
}
