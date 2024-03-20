import { ApiError } from '@/domain/errors';

export type FireBaseErrorInterface = {
  code: string;
  toString: () => string;
  messageL: string;
  statusCode?: number;
};

export abstract class FireBaseErrorAdapter {
  abstract adapterError(error: FireBaseErrorInterface): ApiError;
}
