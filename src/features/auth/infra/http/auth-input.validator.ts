import {
  ClassConstructor,
  runValidate,
  ValidatorOptions,
} from '@/packages/clients/class-validator';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const DROP_UNKNOWN: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: false,
};

/**
 * E-mail presente mas malformado discrimina INVALID_EMAIL; campo ausente (ou
 * qualquer outra falha de forma) cai no VALIDATION_FAILED genérico (specs auth).
 */
export async function assertAuthInputValid<T extends object>(
  schema: ClassConstructor<T>,
  input: unknown,
): Promise<void> {
  const errors = await runValidate(schema, input, DROP_UNKNOWN);
  if (!errors.length) return;

  const body = (
    typeof input === 'object' && input !== null ? input : {}
  ) as Record<string, unknown>;
  const providedEmail = body['email'];
  const malformedEmail = errors.some(
    (error) =>
      error.property === 'email' &&
      error.constraints?.['isEmail'] !== undefined &&
      typeof providedEmail === 'string' &&
      providedEmail.length > 0,
  );
  if (malformedEmail) {
    throw new ValidationError(ErrorCode.INVALID_EMAIL);
  }

  const details = errors
    .map((error) => Object.values(error.constraints ?? {}).join(', '))
    .filter(Boolean)
    .join('; ');
  throw new ValidationError(
    ErrorCode.VALIDATION_FAILED,
    details ? { details } : undefined,
  );
}
