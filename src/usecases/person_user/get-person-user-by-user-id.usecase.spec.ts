import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { PersonUserEntitieDTO } from '@/domain/Person_User/dtos/person-user.dto';
import { PersonUserServiceGateway } from '@/domain/Person_User/gateway/person-user.service.gateway';
import { GetPersonUserByUserIdlUseCase } from './get-person-user-by-user-id.usecase';

let personUserServiceMock: jest.Mocked<PersonUserServiceGateway>;

describe('Get Person User By User Id', () => {
  let getPersonUserByUserIdUseCase: GetPersonUserByUserIdlUseCase;

  beforeEach(() => {
    personUserServiceMock = {
      getPersonUserByUserId: jest.fn(),
    } as any;

    getPersonUserByUserIdUseCase = GetPersonUserByUserIdlUseCase.create({
      personUserService: personUserServiceMock,
    });
  });

  it('should be create a instance of the GetPersonUserByUserIdlUseCase class when will be use create method.', () => {
    expect(getPersonUserByUserIdUseCase).toBeInstanceOf(
      GetPersonUserByUserIdlUseCase,
    );
  });

  it('should call execute method when valid userId and password are provided', async () => {
    personUserServiceMock.getPersonUserByUserId.mockResolvedValue({
      email: 'jonh.doe@example.com',
      firstName: 'john',
      lastName: 'doe',
      userId: 'P1fJ3',
      createdAt: 12121212121212,
      fullName: 'john doe',
      id: '1999',
      updatedAt: null,
    });

    const result = await getPersonUserByUserIdUseCase.execute({
      userId: 'P1fJ3',
    });

    expect(personUserServiceMock.getPersonUserByUserId).toHaveBeenCalledWith({
      userId: 'P1fJ3',
    });

    expect(result.data).not.toBeNull();

    expect((result.data as PersonUserEntitieDTO).fullName).toBe('john doe');
    expect((result.data as PersonUserEntitieDTO).id).toBe('1999');
  });

  it('should call execute method when not valid userId are provided', async () => {
    const error = await getPersonUserByUserIdUseCase
      .execute({
        userId: '',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });

    expect(personUserServiceMock.getPersonUserByUserId).not.toHaveBeenCalled();
  });
});
