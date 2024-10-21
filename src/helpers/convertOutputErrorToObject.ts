import { ApiError } from './errors';

export const convertOutputErrorToObject = (error: ApiError) => {
  return error instanceof ApiError
    ? JSON.parse(JSON.stringify(error, null, 2))
    : null;
};
