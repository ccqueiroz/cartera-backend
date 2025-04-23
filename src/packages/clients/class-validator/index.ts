import { ValidationArguments } from './../../../../node_modules/class-validator/types/validation/ValidationArguments.d';
import 'reflect-metadata';
import {
  validate,
  ValidationError,
  ValidatorOptions,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';

const OnlyOnePropertieDefined = (
  props: Array<string>,
  validateOptions?: ValidationOptions,
) => {
  return function (target: object, key: string) {
    registerDecorator({
      name: 'OnlyOnePropertieDefined',
      target: target.constructor,
      propertyName: key,
      options: validateOptions,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const object = args.object as any;
          const isDefined = props.filter((prop) => !!object[prop]);
          return isDefined.length <= 1;
        },
        defaultMessage() {
          return `Only a accept a one of [${props.join(', ')}] defined.`;
        },
      },
    });
  };
};

const runValidate = async <T extends object, V = T>(
  clas: ClassConstructor<T>,
  input: V,
  validatorOptions?: ValidatorOptions,
): Promise<ValidationError[]> => {
  const model = plainToInstance(clas, input);

  return await validate(model, validatorOptions);
};

export { runValidate, OnlyOnePropertieDefined };
export * from 'class-validator';
export * from 'class-transformer';
