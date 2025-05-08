import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';

const paymentMethods = [
  {
    id: randomUUID(),
    description: 'Cartão de Débito',
  },
  {
    id: randomUUID(),
    description: 'Cartão de Crédito',
  },
  {
    id: randomUUID(),
    description: 'Boleto Bancário',
  },
  {
    id: randomUUID(),
    description: 'Dinheiro',
  },
  {
    id: randomUUID(),
    description: 'Vale Refeição',
  },
  {
    id: randomUUID(),
    description: 'Vale Alimentação',
  },
  {
    id: randomUUID(),
    description: 'Pix',
  },
  {
    id: randomUUID(),
    description: 'Cheque',
  },
  {
    id: randomUUID(),
    description: 'Promissória',
  },
  {
    id: randomUUID(),
    description: 'Depósito',
  },
];

export default async function (db: admin.firestore.Firestore) {
  const paymentMethodsRef = db.collection('Payment_Method');

  for (const method of paymentMethods) {
    await paymentMethodsRef.doc(method.id).set({
      id: method.id,
      description: method.description,
      createdAt: new Date().getTime(),
      updatedAt: null,
    });
    console.log(`Documento criado: ${method.description}`);
  }
}
