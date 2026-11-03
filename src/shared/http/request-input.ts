import type { Request } from 'express';
import {
  ClassConstructor,
  runValidate,
  ValidatorOptions,
} from '@/packages/clients/class-validator';
import {
  UnauthorizedError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export const REJECT_UNKNOWN: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
};

export const DROP_UNKNOWN: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: false,
};

export async function assertValid<T extends object>(
  schema: ClassConstructor<T>,
  input: unknown,
  options: ValidatorOptions = REJECT_UNKNOWN,
): Promise<void> {
  const errors = await runValidate(schema, input, options);
  if (errors.length === 0) return;
  const details = errors
    .map((error) => Object.values(error.constraints ?? {}).join(', '))
    .filter(Boolean)
    .join('; ');
  throw new ValidationError(
    ErrorCode.VALIDATION_FAILED,
    details ? { details } : undefined,
  );
}

export function userIdFrom(req: Request): string {
  const userId = req.user_auth?.userId;
  if (!userId) throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
  return userId;
}

export function numberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function booleanOrUndefined(value: unknown): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}
