import { Firestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

const categories = [
  {
    id: randomUUID(),
    description: 'Restaurante',
  },
  {
    id: randomUUID(),
    description: 'Shopping',
  },
  {
    id: randomUUID(),
    description: 'Saúde',
  },
  {
    id: randomUUID(),
    description: 'Lazer',
  },
  {
    id: randomUUID(),
    description: 'Festa',
  },
  {
    id: randomUUID(),
    description: 'Profissional',
  },
  {
    id: randomUUID(),
    description: 'App Refeição',
  },
  {
    id: randomUUID(),
    description: 'App Mobilidade',
  },
  {
    id: randomUUID(),
    description: 'supermercado',
  },
  {
    id: randomUUID(),
    description: 'Combustível',
  },
  {
    id: randomUUID(),
    description: 'Educação',
  },
  {
    id: randomUUID(),
    description: 'Aluguel e/ou Financiamento Residencial',
  },
  {
    id: randomUUID(),
    description: 'Carta de Crédito',
  },
  {
    id: randomUUID(),
    description: 'Financiamento',
  },
  {
    id: randomUUID(),
    description: 'Serviços Públicos',
  },
  {
    id: randomUUID(),
    description: 'Telefonia/Internet',
  },
  {
    id: randomUUID(),
    description: 'Seguros',
  },
  {
    id: randomUUID(),
    description: 'Vestuário',
  },
  {
    id: randomUUID(),
    description: 'Transporte Público',
  },
  {
    id: randomUUID(),
    description: 'Viagens',
  },
  {
    id: randomUUID(),
    description: 'Presentes',
  },
  {
    id: randomUUID(),
    description: 'Empréstimos',
  },
  {
    id: randomUUID(),
    description: 'Poupança e Investimentos',
  },
  {
    id: randomUUID(),
    description: 'Manutenção de Veículos',
  },
  {
    id: randomUUID(),
    description: 'Manutenção Residencial',
  },
  {
    id: randomUUID(),
    description: 'Beleza e Cuidados Pessoais',
  },
  {
    id: randomUUID(),
    description: 'Academia/Fitness',
  },
  {
    id: randomUUID(),
    description: 'Manutenção Residencial',
  },
  {
    id: randomUUID(),
    description: 'Livros e Materiais de Leitura',
  },
  {
    id: randomUUID(),
    description: 'Jogos e Brinquedos',
  },
  {
    id: randomUUID(),
    description: 'Eletrônicos e Acessórios',
  },
  {
    id: randomUUID(),
    description: 'Reforma Doméstica',
  },
  {
    id: randomUUID(),
    description: 'Mobília e Decoração',
  },
  {
    id: randomUUID(),
    description: 'Jardim e Exteriores',
  },
  {
    id: randomUUID(),
    description: 'Assistência Médica, Remédios e Afins',
  },
  {
    id: randomUUID(),
    description: 'Cuidados com Pets',
  },
  {
    id: randomUUID(),
    description: 'Serviços de Limpeza',
  },
  {
    id: randomUUID(),
    description: 'Lavanderia e Lavagem a Seco',
  },
  {
    id: randomUUID(),
    description: 'Taxas e Impostos',
  },
  {
    id: randomUUID(),
    description: 'Caridade e Doações',
  },
  {
    id: randomUUID(),
    description: 'Cuidado com Crianças',
  },
  {
    id: randomUUID(),
    description: 'Despesas de Negócios',
  },
  {
    id: randomUUID(),
    description: 'Música e Arte',
  },
  {
    id: randomUUID(),
    description: 'Materiais de Escritório',
  },
  {
    id: randomUUID(),
    description: 'Tecnologia e Sfotwares',
  },
  {
    id: randomUUID(),
    description: 'Serviços Jurídicos',
  },
  {
    id: randomUUID(),
    description: 'Serviços de Contabilidade',
  },
  {
    id: randomUUID(),
    description: 'Artigos Esportivos',
  },
  {
    id: randomUUID(),
    description: 'Eventos e Conferências',
  },
  {
    id: randomUUID(),
    description: 'Taxas de Associações',
  },
  {
    id: randomUUID(),
    description: 'Serviços de Streaming',
  },
  {
    id: randomUUID(),
    description: 'Consumos Diversos',
  },
  {
    id: randomUUID(),
    description: 'Taxas Bancárias',
  },
];

export default async function (db: Firestore) {
  const categoriesRef = db.collection('Category');

  for (const method of categories) {
    await categoriesRef.doc(method.id).set({
      id: method.id,
      description: method.description,
      createdAt: new Date().getTime(),
      updatedAt: null,
    });
    console.log(`Documento criado: ${method.description}`);
  }
}
