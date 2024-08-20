import swaggerJSDoc, { OAS3Options } from 'swagger-jsdoc';

export class SwaggerSpec {
  private static instance: SwaggerSpec;
  private swaggerSpec: object;

  constructor(definitions: OAS3Options) {
    this.swaggerSpec = swaggerJSDoc(definitions);
  }

  public static getInstance(definitions?: OAS3Options): SwaggerSpec {
    if (!SwaggerSpec.instance && definitions) {
      SwaggerSpec.instance = new SwaggerSpec(definitions);
    } else if (!definitions) {
      throw new Error(
        'Swagger definitions must be provided for the first instance create',
      );
    }
    return SwaggerSpec.instance;
  }

  public getSpec() {
    return this.swaggerSpec;
  }
}
