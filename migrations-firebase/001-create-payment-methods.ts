import { PaymentMethodDescriptionEnum } from './../src/domain/Payment_Method/enums/payment-method-description.enum';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';

const paymentMethods = [
  {
    id: randomUUID(),
    description: 'Cartão de Débito',
    descriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
  },
  {
    id: randomUUID(),
    description: 'Cartão de Crédito',
    descriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
  },
  {
    id: randomUUID(),
    description: 'Boleto Bancário',
    descriptionEnum: PaymentMethodDescriptionEnum.BANK_SLIP,
  },
  {
    id: randomUUID(),
    description: 'Depósito Bancário',
    descriptionEnum: PaymentMethodDescriptionEnum.BANK_DEPOSIT,
  },
  {
    id: randomUUID(),
    description: 'Transferência Bancária',
    descriptionEnum: PaymentMethodDescriptionEnum.BANK_TRANSFER,
  },
  {
    id: randomUUID(),
    description: 'Débito Automático',
    descriptionEnum: PaymentMethodDescriptionEnum.AUTOMATIC_DEBIT,
  },
  {
    id: randomUUID(),
    description: 'Carnê',
    descriptionEnum: PaymentMethodDescriptionEnum.BOOKLET,
  },
  {
    id: randomUUID(),
    description: 'Dinheiro',
    descriptionEnum: PaymentMethodDescriptionEnum.CASH,
  },
  {
    id: randomUUID(),
    description: 'Cheque',
    descriptionEnum: PaymentMethodDescriptionEnum.CHECK,
  },
  {
    id: randomUUID(),
    description: 'Promissória',
    descriptionEnum: PaymentMethodDescriptionEnum.PROMISSORY,
  },
  {
    id: randomUUID(),
    description: 'Financiamento',
    descriptionEnum: PaymentMethodDescriptionEnum.FINANCING,
  },
  {
    id: randomUUID(),
    description: 'Vale Refeição',
    descriptionEnum: PaymentMethodDescriptionEnum.MEAL_VOUCHER,
  },
  {
    id: randomUUID(),
    description: 'Vale Alimentação',
    descriptionEnum: PaymentMethodDescriptionEnum.FOOD_VOUCHER,
  },
  {
    id: randomUUID(),
    description: 'Pix',
    descriptionEnum: PaymentMethodDescriptionEnum.PIX,
  },
  {
    id: randomUUID(),
    description: 'Criptomoeda',
    descriptionEnum: PaymentMethodDescriptionEnum.CRYPTOCURRENCY,
  },
];

export default async function (db: admin.firestore.Firestore) {
  const paymentMethodsRef = db.collection('Payment_Method');

  for (const method of paymentMethods) {
    await paymentMethodsRef.doc(method.id).set({
      id: method.id,
      description: method.description,
      descriptionEnum: method.descriptionEnum,
      createdAt: new Date().getTime(),
      updatedAt: null,
    });
    console.log(`Documento criado: ${method.description}`);
  }
}
