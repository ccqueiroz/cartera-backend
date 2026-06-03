import { PaymentMethodDescriptionEnum } from './enums/payment-method-description.enum';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';

const paymentMethods = [
  {
    description: 'Cartão de Débito',
    descriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
  },
  {
    description: 'Cartão de Crédito',
    descriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
  },
  {
    description: 'Boleto Bancário',
    descriptionEnum: PaymentMethodDescriptionEnum.BANK_SLIP,
  },
  {
    description: 'Depósito Bancário',
    descriptionEnum: PaymentMethodDescriptionEnum.BANK_DEPOSIT,
  },
  {
    description: 'Transferência Bancária',
    descriptionEnum: PaymentMethodDescriptionEnum.BANK_TRANSFER,
  },
  {
    description: 'Débito Automático',
    descriptionEnum: PaymentMethodDescriptionEnum.AUTOMATIC_DEBIT,
  },
  {
    description: 'Carnê',
    descriptionEnum: PaymentMethodDescriptionEnum.BOOKLET,
  },
  {
    description: 'Dinheiro',
    descriptionEnum: PaymentMethodDescriptionEnum.CASH,
  },
  {
    description: 'Cheque',
    descriptionEnum: PaymentMethodDescriptionEnum.CHECK,
  },
  {
    description: 'Promissória',
    descriptionEnum: PaymentMethodDescriptionEnum.PROMISSORY,
  },
  {
    description: 'Financiamento',
    descriptionEnum: PaymentMethodDescriptionEnum.FINANCING,
  },
  {
    description: 'Vale Refeição',
    descriptionEnum: PaymentMethodDescriptionEnum.MEAL_VOUCHER,
  },
  {
    description: 'Vale Alimentação',
    descriptionEnum: PaymentMethodDescriptionEnum.FOOD_VOUCHER,
  },
  {
    description: 'Pix',
    descriptionEnum: PaymentMethodDescriptionEnum.PIX,
  },
  {
    description: 'Criptomoeda',
    descriptionEnum: PaymentMethodDescriptionEnum.CRYPTOCURRENCY,
  },
  {
    description: 'Carteira Digital',
    descriptionEnum: PaymentMethodDescriptionEnum.DIGITAL_WALLET,
  },
];

export default async function (db: admin.firestore.Firestore) {
  const paymentMethodsRef = db.collection('Payment_Method');

  for (const method of paymentMethods) {
    const existing = await paymentMethodsRef
      .where('descriptionEnum', '==', method.descriptionEnum)
      .limit(1)
      .get();

    const nowIso = new Date().toISOString();

    if (!existing.empty) {
      const doc = existing.docs[0];
      const data = doc.data();
      await doc.ref.set({
        id: data.id,
        description: method.description,
        descriptionEnum: method.descriptionEnum,
        createdAt: data.createdAt ?? nowIso,
        updatedAt: nowIso,
        deletedAt: data.deletedAt ?? null,
      });
      continue;
    }

    const id = randomUUID();
    await paymentMethodsRef.doc(id).set({
      id,
      description: method.description,
      descriptionEnum: method.descriptionEnum,
      createdAt: nowIso,
      updatedAt: null,
      deletedAt: null,
    });
  }
}
