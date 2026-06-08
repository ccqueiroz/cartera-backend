import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { PaymentStatusEnum } from '../src/shared/kernel/enums/payment-status.enum';

const newPaymentStatuses: { code: PaymentStatusEnum; label: string }[] = [
  { code: PaymentStatusEnum.IN_PROGRESS, label: 'Em andamento' },
];

export default async function (db: admin.firestore.Firestore) {
  const paymentStatusRef = db.collection('Payment_Status');

  for (const status of newPaymentStatuses) {
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
