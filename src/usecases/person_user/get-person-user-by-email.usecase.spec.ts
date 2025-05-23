import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { GetPersonUserByEmailUseCase } from './get-person-user-by-email.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { PersonUserEntitieDTO } from '@/domain/Person_User/dtos/person-user.dto';
import { PersonUserServiceGateway } from '@/domain/Person_User/gateway/person-user.service.gateway';

let personUserServiceMock: jest.Mocked<PersonUserServiceGateway>;
let emailValidatorGatewayMock: jest.Mocked<EmailValidatorGateway>;
describe('Get Person User By Email', () => {
  let getPersonUserByEmailUseCase: GetPersonUserByEmailUseCase;

  beforeEach(() => {
    personUserServiceMock = {
      getPersonUserByEmail: jest.fn(),
    } as any;

    emailValidatorGatewayMock = {
      validate: jest.fn(),
    } as any;

    getPersonUserByEmailUseCase = GetPersonUserByEmailUseCase.create({
      personUserService: personUserServiceMock,
      emailValidatorGateway: emailValidatorGatewayMock,
    });
  });

  it('should be create a instance of the GetPersonUserByEmailUseCase class when will be use create method.', () => {
    expect(getPersonUserByEmailUseCase).toBeInstanceOf(
      GetPersonUserByEmailUseCase,
    );
  });

  it('should call execute method when valid email and password are provided', async () => {
    personUserServiceMock.getPersonUserByEmail.mockResolvedValue({
      email: 'jonh.doe@example.com',
      firstName: 'john',
      lastName: 'doe',
      userId: 'P1fJ3',
      createdAt: 12121212121212,
      fullName: 'john doe',
      id: '1999',
      updatedAt: null,
    });

    emailValidatorGatewayMock.validate.mockReturnValue(true);

    const result = await getPersonUserByEmailUseCase.execute({
      email: 'jonh.doe@example.com',
    });

    expect(personUserServiceMock.getPersonUserByEmail).toHaveBeenCalledWith({
      email: 'jonh.doe@example.com',
    });

    expect(result.data).not.toBeNull();

    expect((result.data as PersonUserEntitieDTO).fullName).toBe('john doe');
    expect((result.data as PersonUserEntitieDTO).id).toBe('1999');
  });

  it('should call execute method when not valid email are provided', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(false);

    const error = await getPersonUserByEmailUseCase
      .execute({
        email: '',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_EMAIL,
      statusCode: 400,
    });

    expect(personUserServiceMock.getPersonUserByEmail).not.toHaveBeenCalled();
  });
});
