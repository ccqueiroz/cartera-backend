import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { PaymentStatusDescriptionEnum } from '../src/domain/Payment_Status/enum/payment-status-description.enum';

const paymentStatus = [
  {
    id: randomUUID(),
    description: 'Pago',
    descriptionEnum: PaymentStatusDescriptionEnum.PAID,
  },
  {
    id: randomUUID(),
    description: 'Recebido',
    descriptionEnum: PaymentStatusDescriptionEnum.RECEIVED,
  },
  {
    id: randomUUID(),
    description: 'A Pagar',
    descriptionEnum: PaymentStatusDescriptionEnum.TO_PAY,
  },
  {
    id: randomUUID(),
    description: 'A Receber',
    descriptionEnum: PaymentStatusDescriptionEnum.TO_RECEIVE,
  },
  {
    id: randomUUID(),
    description: 'A Vencer',
    descriptionEnum: PaymentStatusDescriptionEnum.DUE_SOON,
  },
  {
    id: randomUUID(),
    description: 'Dia do Vencimento',
    descriptionEnum: PaymentStatusDescriptionEnum.DUE_DAY,
  },
  {
    id: randomUUID(),
    description: 'Vencido',
    descriptionEnum: PaymentStatusDescriptionEnum.OVERDUE,
  },
];

export default async function (db: admin.firestore.Firestore) {
  const paymentStatusRef = db.collection('Payment_Status');

  for (const method of paymentStatus) {
    await paymentStatusRef.doc(method.id).set({
      id: method.id,
      description: method.description,
      descriptionEnum: method.descriptionEnum,
      createdAt: new Date().getTime(),
      updatedAt: null,
    });
    console.log(`Documento criado: ${method.description}`);
  }
}
