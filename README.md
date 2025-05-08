![CI](https://github.com/ccqueiroz/cartera-backend/actions/workflows/ci-cd.yml/badge.svg?branch=dev)

## Versões README

[Português 🇧🇷](https://github.com/ccqueiroz/cartera-backend/blob/main/README.md) | [English 🇺🇸](https://github.com/ccqueiroz/cartera-backend/blob/main/README-en.md)

# 💼 Cartera - Backend

O **Cartera** é um sistema de gerenciamento financeiro pessoal projetado para ajudar pessoas a organizarem suas finanças, controlar gastos, planejar metas e tomar decisões financeiras mais inteligentes.

Este repositório contém a **camada backend** da aplicação, construída com foco em escalabilidade, manutenibilidade e boas práticas de desenvolvimento de software, incluindo o uso da **Clean Architecture**.

---

## ✨ Funcionalidades

- [x] Cadastro e autenticação de usuários com Firebase Auth.
- [ ] Gerenciamento de:
  - [x] Receitas e despesas
  - [x] Contas e carteiras
  - [ ] Cartões de crédito e faturas
  - [ ] Listas de compras
  - [ ] Metas financeiras
- [x] Cache com Redis para alto desempenho.
- [x] Estrutura modular baseada em Clean Architecture.
- [x] API RESTful documentada e testável.

---

## 🧠 Arquitetura & Padrões

Este projeto adota a **Clean Architecture**, separando o sistema em camadas independentes:

- **Entities**: Regras de negócio puras.
- **Use Cases**: Orquestram as regras de negócio.
- **Gateways/Repositories**: Interfaces com o mundo externo (banco, cache, API).
- **Controllers**: Recebem as requisições HTTP e chamam os casos de uso.

**Principais padrões utilizados:**

- Repository Pattern
- DTOs para entrada/saída de dados
- Inversão de Dependência
- Validações externas e reutilizáveis
- Segregação de responsabilidades por camadas

---

## 🚀 Tecnologias

| Ferramenta        | Descrição                                  |
| ----------------- | ------------------------------------------ |
| Node.js + Express | Framework principal de aplicação           |
| TypeScript        | Tipagem estática e melhores práticas       |
| Firebase          | Autenticação de usuários                   |
| Redis             | Cache de dados                             |
| Docker            | Contêinerização para ambientes isolados    |
| Jest              | Testes unitários                           |
| GitHub Actions    | CI/CD com verificação automática de builds |
| ESLint + Prettier | Padronização e qualidade de código         |

<br/>

![Arquitetura](https://github.com/ccqueiroz/cartera-backend/blob/dev/assets/images/fluxo-arquitetura-cartera.png 'Arquitetura')

---

## 🧪 Testes

```
yarn test:unit
```

- Cobertura dos principais casos de uso

- Testes unitários com Jest

- Validações de fluxo com mocks

---

## 💻 Executando localmente

```
# Clone o repositório

git clone https://github.com/ccqueiroz/cartera-backend.git

# Instale as dependências

yarn install

# Execute com ts-node

yarn start:docker:dev
```

**_Observação_**

- Para rodar o projeto, é necessário inserir criar um arquivo .env e um .env.docker.env

```
##Arquivo .env e .env.docker.env

PORT=

SWAGGER_HOST=

FIREBASE_CONFIG_API_KEY=
FIREBASE_CONFIG_AUTH_DOMAIN=
FIREBASE_CONFIG_PROJECT_ID=
FIREBASE_CONFIG_STORAGE_BUCKET=
FIREBASE_CONFIG_MESSAGING_SENDER_ID=
FIREBASE_CONFIG_APP_ID=

FIREBASE_SERVICE_ACCOUNT_TYPE=
FIREBASE_SERVICE_ACCOUNT_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID=
FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY=
FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL=
FIREBASE_SERVICE_ACCOUNT_CLIENT_ID=
FIREBASE_SERVICE_ACCOUNT_AUTH_URI=
FIREBASE_SERVICE_ACCOUNT_TOKEN_URI=
FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_URL=
FIREBASE_SERVICE_ACCOUNT_CLIENT_URL=
FIREBASE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN=

REDIS_HOST_NAME=
REDIS_HOST_PORT=
REDIS_USERNAME=
REDIS_PASSWORD=
```

---

## 🔐 CI/CD e Proteção de Branches

**O repositório conta:**

- GitHub Actions para automação de testes
- Branchs protegidas com regras de validação por estágio de desenvolvimento
  - main
  - test
  - dev
- Pull Requests obrigatórios para deploy

---

## Licença

Esta Api está sob a licença [MIT](./LICENSE).

---

### Autor

<div style="margin-top: 15px; margin-bottom: 5px;">
    <img style="border-radius: 50%;" src="https://github.com/ccqueiroz.png" width="100px;" alt=""/>
    <br />
    <sub style="margin-left: 15px">
        <b>Caio Queiroz</b>
    </sub>
</div>

[![Linkedin Badge](https://img.shields.io/badge/-Caio%20Queiroz-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/caio-queiroz-83846399/)](https://www.linkedin.com/in/caio-queiroz-83846399/)
[![Gmail Badge](https://img.shields.io/badge/-caio.cezar.dequeiroz@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:caio.cezar.dequeiroz@gmail.com)](mailto:caio.cezar.dequeiroz@gmail.com)
