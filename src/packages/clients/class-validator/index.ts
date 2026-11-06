import 'reflect-metadata';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';

const runValidate = async <T extends object, V = T>(
  clas: ClassConstructor<T>,
  input: V,
  validatorOptions?: ValidatorOptions,
): Promise<ValidationError[]> => {
  const model = plainToInstance(clas, input);

  return await validate(model, validatorOptions);
};

export { runValidate };
export * from 'class-validator';
export * from 'class-transformer';
