import { CategoryType } from './../src/domain/Category/enums/category-type.enum';
import { Firestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

const categories = [
  // Bills
  {
    id: randomUUID(),
    description: 'Restaurantes e Alimentação',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Supermercado',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Compras e Lazer',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Saúde e Bem-Estar',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Eventos e Festas',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Educação e Leitura',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Moradia e Manutenção Residencial',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Serviços e Utilidades Públicas',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Transporte e Mobilidade',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Seguros e Proteção',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Vestuário e Acessórios',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Viagens e Turismo',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Presentes e Doações',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Taxas e Impostos',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Cuidados com Pets',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Cuidados com Dependentes',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Serviços de Limpeza e Lavanderia',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Despesas de Negócios e Escritório',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Tecnologia e Software',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Serviços Profissionais',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Artigos Esportivos e Hobbies',
    type: CategoryType.BILLS,
  },
  {
    id: randomUUID(),
    description: 'Consumos Diversos',
    type: CategoryType.BILLS,
  },
  // Receivables
  {
    id: randomUUID(),
    description: 'Salário/Pró-labore',
    type: CategoryType.RECEIVABLE,
  },
  {
    id: randomUUID(),
    description: 'Recebimento por Serviço Prestado',
    type: CategoryType.RECEIVABLE,
  },
  {
    id: randomUUID(),
    description: 'Aluguéis e Rendimentos de Ativos',
    type: CategoryType.RECEIVABLE,
  },
  {
    id: randomUUID(),
    description: 'Investimentos e Rendimentos Financeiros',
    type: CategoryType.RECEIVABLE,
  },
  {
    id: randomUUID(),
    description: 'Reembolsos e Indenizações',
    type: CategoryType.RECEIVABLE,
  },
  {
    id: randomUUID(),
    description: 'Comissões e Bonificações',
    type: CategoryType.RECEIVABLE,
  },
  {
    id: randomUUID(),
    description: 'Doações e Heranças',
    type: CategoryType.RECEIVABLE,
  },
  {
    id: randomUUID(),
    description: 'Aportes e Financiamentos',
    type: CategoryType.RECEIVABLE,
  },
  {
    id: randomUUID(),
    description: 'Receitas de Parcerias e Patrocínios',
    type: CategoryType.RECEIVABLE,
  },
  {
    id: randomUUID(),
    description: 'Aposentadorias e Pensões',
    type: CategoryType.RECEIVABLE,
  },
  {
    id: randomUUID(),
    description: 'Receitas Diversas',
    type: CategoryType.RECEIVABLE,
  },
];

export default async function (db: Firestore) {
  const categoriesRef = db.collection('Category');

  for (const method of categories) {
    await categoriesRef.doc(method.id).set({
      id: method.id,
      description: method.description,
      type: method.type,
      createdAt: new Date().getTime(),
      updatedAt: null,
    });
    console.log(`Documento criado: ${method.description}`);
  }
}
