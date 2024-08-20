import { SwaggerSpec } from './swaggerSpec';
import swaggerDefinitions from './swaggerOptions';
import swaggerUiExpress from 'swagger-ui-express';

export type ServerDocumentation = typeof swaggerUiExpress.serve;

export type SetupDocumentation = typeof swaggerUiExpress.setup;

const API_DOC = '/api-doc';

const swaggerSpecInstance =
  SwaggerSpec.getInstance(swaggerDefinitions).getSpec();

const swaggerUi = swaggerUiExpress;

const swaggerServer: ServerDocumentation = swaggerUi.serve;

const swaggerSetup: SetupDocumentation = swaggerUi.setup;

export { API_DOC, swaggerServer, swaggerSetup, swaggerSpecInstance };
