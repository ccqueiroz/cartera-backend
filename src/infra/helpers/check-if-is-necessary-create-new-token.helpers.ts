import { ApiError } from '@/helpers/errors';
import { CheckIfIsNecessaryCreateNewTokenGateWay } from '@/domain/Auth/helpers/check-if-is-necessary-create-new-token.gateway';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
export class CheckIfIsNecessaryCreateNewTokenHelpers
  implements CheckIfIsNecessaryCreateNewTokenGateWay
{
  execute(token: number): boolean {
    const _REMOVE_MINUTES = 5;
    if (!token) throw new ApiError(ERROR_MESSAGES.INVALID_TOKEN, 401);
    const unixTimeStampCurrentDate =
      Math.floor(new Date().getTime() / 1000 - _REMOVE_MINUTES * 60) * 1000;
    const tokenWithoutFiveMinutes = token - _REMOVE_MINUTES * 60 * 1000;

    return unixTimeStampCurrentDate >= tokenWithoutFiveMinutes;
  }
}
