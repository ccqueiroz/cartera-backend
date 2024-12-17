import { Firestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

const paymentStatus = [
  {
    id: randomUUID(),
    description: 'Pago',
  },
  {
    id: randomUUID(),
    description: 'A pagar',
  },
  {
    id: randomUUID(),
    description: 'A receber',
  },
  {
    id: randomUUID(),
    description: 'Recebido',
  },
  {
    id: randomUUID(),
    description: 'Vencido',
  },
];

export default async function (db: Firestore) {
  const paymentStatusRef = db.collection('Payment_Status');

  for (const method of paymentStatus) {
    await paymentStatusRef.doc(method.id).set({
      id: method.id,
      description: method.description,
      createdAt: `${new Date().getTime()}`,
      updatedAt: '',
    });
    console.log(`Documento criado: ${method.description}`);
  }
}
