![CI](https://github.com/ccqueiroz/cartera-backend/actions/workflows/ci-cd.yml/badge.svg?branch=dev)

## README Versions

[Portuguese 🇧🇷](https://github.com/ccqueiroz/cartera-backend/blob/main/README.md) | [English 🇺🇸](https://github.com/ccqueiroz/cartera-backend/blob/main/README-en.md)

# 💼 Cartera - Backend

**Cartera** is a personal finance management system designed to help people organize their finances, control expenses, plan goals, and make smarter financial decisions.

This repository contains the **backend layer** of the application, built with a focus on scalability, maintainability, and software development best practices, including the use of **Clean Architecture**.

---

## ✨ Features

- [x] User registration and authentication with Firebase Auth.
- [ ] Management of:

  - [x] Income and expenses
  - [x] Accounts and wallets
  - [ ] Credit cards and invoices
  - [ ] Shopping lists
  - [ ] Financial goals

- [x] High-performance caching with Redis.
- [x] Modular structure based on Clean Architecture.
- [x] RESTful API, documented and testable.

---

## 🧬 Architecture & Patterns

This project adopts **Clean Architecture**, separating the system into independent layers:

- **Entities**: Pure business rules.
- **Use Cases**: Orchestrate business rules.
- **Gateways/Repositories**: Interfaces with the external world (database, cache, APIs).
- **Controllers**: Handle HTTP requests and invoke use cases.

**Key patterns used:**

- Repository Pattern
- DTOs for input/output
- Dependency Inversion
- External and reusable validations
- Layered responsibility segregation

---

## 🚀 Technologies

| Tool              | Description                                |
| ----------------- | ------------------------------------------ |
| Node.js + Express | Core application framework                 |
| TypeScript        | Static typing and best practices           |
| Firebase          | User authentication                        |
| Redis             | Data caching                               |
| Docker            | Containerization for isolated environments |
| Jest              | Unit testing                               |
| GitHub Actions    | CI/CD with automatic build verification    |
| ESLint + Prettier | Code style and quality enforcement         |

<br/>

![Architecture](assets/images/fluxo-arquitetura-cartera.png 'Architecture')

---

## 🧪 Testing

```
yarn test:unit
```

- Coverage of main use cases
- Unit tests with Jest
- Flow validation with mocks

---

## 💻 Running Locally

```
# Clone the repository
git clone https://github.com/ccqueiroz/cartera-backend.git

# Install dependencies
yarn install

# Run with ts-node
yarn start:docker:dev
```

**_Note_**

- To run the project, you need to create a `.env` and a `.env.docker.env` file:

```
## .env and .env.docker.env file

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

## 🔐 CI/CD & Branch Protection

**This repository includes:**

- GitHub Actions for test automation
- Protected branches with validation rules by development stage:

  - main
  - test
  - dev

- Mandatory Pull Requests for deployment

---

## License

This API is licensed under the [MIT](./LICENSE) license.

---

### Author

<div style="margin-top: 15px; margin-bottom: 5px;">
    <img style="border-radius: 50%;" src="https://github.com/ccqueiroz.png" width="100px;" alt=""/>
    <br />
    <sub style="margin-left: 15px">
        <b>Caio Queiroz</b>
    </sub>
</div>

[![Linkedin Badge](https://img.shields.io/badge/-Caio%20Queiroz-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/caio-queiroz-83846399/)](https://www.linkedin.com/in/caio-queiroz-83846399/)
[![Gmail Badge](https://img.shields.io/badge/-caio.cezar.dequeiroz@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:caio.cezar.dequeiroz@gmail.com)](mailto:caio.cezar.dequeiroz@gmail.com)
