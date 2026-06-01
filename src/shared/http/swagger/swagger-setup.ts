import type { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import { swaggerDefinition } from '@/shared/http/swagger/swagger-definition';

export class SwaggerSetup {
  private readonly spec: object;

  private constructor() {
    this.spec = swaggerJSDoc(swaggerDefinition);
  }

  public static create(): SwaggerSetup {
    return new SwaggerSetup();
  }

  public mount(app: Express): void {
    app.use(
      '/api-docs',
      swaggerUiExpress.serve,
      swaggerUiExpress.setup(this.spec, {
        swaggerOptions: { withCredentials: true },
      }),
    );
  }
}
