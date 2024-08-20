import { OAS3Options } from 'swagger-jsdoc';

const swaggerDefinition: OAS3Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cartera-Api',
      version: '1.0.0',
      description:
        'Cartera é um sistema de controle financeiro pessoal que facilita o gerenciamento de finanças, permitindo cadastro de receitas, despesas, cartões de crédito e faturas. Oferece também ferramentas para listas de compras e metas de poupança, promovendo organização financeira e alcance de objetivos.',
    },
    servers: [
      {
        url: 'http://localhost:8889',
        description: 'Servidor de Desenvolvimento',
      },
    ],
  },
  apis: ['src/infra/api/express/routes/**/*.route.ts'],
};

export default swaggerDefinition;
