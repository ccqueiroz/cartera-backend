import { CheckIfIsNecessaryCreateNewTokenHelpers } from './check-if-is-necessary-create-new-token.helpers';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';

describe('Check if is Necessary Create a New Token', () => {
  let checkIfIsNecessaryCreateNewTokenHelpers: CheckIfIsNecessaryCreateNewTokenHelpers;
  const _REMOVE_MINUTES = 5;

  beforeEach(() => {
    checkIfIsNecessaryCreateNewTokenHelpers =
      new CheckIfIsNecessaryCreateNewTokenHelpers();
  });

  it('should be create a instance of the CheckIfIsNecessaryCreateNewTokenHelpers class when it is instantiated.', () => {
    expect(checkIfIsNecessaryCreateNewTokenHelpers).toBeInstanceOf(
      CheckIfIsNecessaryCreateNewTokenHelpers,
    );
  });

  it('should throw an error if token is not provided', () => {
    expect(() => checkIfIsNecessaryCreateNewTokenHelpers.execute(null)).toThrow(
      new ApiError(ERROR_MESSAGES.INVALID_TOKEN, 401),
    );
  });

  it('should return true if the token is older than the allowed time minus 5 minutes', () => {
    const currentUnixTime = Math.floor(new Date().getTime() / 1000) * 1000;
    const oldToken = currentUnixTime - (_REMOVE_MINUTES * 60 * 1000 + 1000);

    const result = checkIfIsNecessaryCreateNewTokenHelpers.execute(oldToken);

    expect(result).toBe(true);
  });

  it('should return false if the token is within the allowed time frame', () => {
    const result =
      checkIfIsNecessaryCreateNewTokenHelpers.execute(99999999999999);

    expect(result).toBe(false);
  });
});
