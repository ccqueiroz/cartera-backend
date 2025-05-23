import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { CreatePersonUserUseCase } from './create-person-user.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { PersonUserServiceGateway } from '@/domain/Person_User/gateway/person-user.service.gateway';

let personUserServiceMock: jest.Mocked<PersonUserServiceGateway>;
let emailValidatorGatewayMock: jest.Mocked<EmailValidatorGateway>;

describe('Create Person User Usecase', () => {
  let createPersonUserUseCase: CreatePersonUserUseCase;

  beforeEach(() => {
    personUserServiceMock = {
      getPersonUserByEmail: jest.fn(),
      createPersonUser: jest.fn(),
    } as any;

    emailValidatorGatewayMock = {
      validate: jest.fn(),
    } as any;

    createPersonUserUseCase = CreatePersonUserUseCase.create({
      personUserService: personUserServiceMock,
      emailValidatorGateway: emailValidatorGatewayMock,
    });
  });

  it('should be create a instance of the CreatePersonUserUseCase class when will be use create method.', () => {
    expect(createPersonUserUseCase).toBeInstanceOf(CreatePersonUserUseCase);
  });

  it('should call execute method when valid email and password are provided', async () => {
    personUserServiceMock.createPersonUser.mockResolvedValue({
      id: 'P1fJ3',
      fullName: 'john doe',
    });

    emailValidatorGatewayMock.validate.mockReturnValue(true);

    const result = await createPersonUserUseCase.execute({
      email: 'jonh.doe@example.com',
      firstName: 'john',
      lastName: 'doe',
      userId: 'P1fJ3',
      createdAt: 12121212121212,
    });

    expect(personUserServiceMock.createPersonUser).toHaveBeenCalledWith({
      email: 'jonh.doe@example.com',
      firstName: 'john',
      lastName: 'doe',
      userId: 'P1fJ3',
      createdAt: 12121212121212,
    });

    expect(result.data).not.toBeNull();

    expect(result.data?.fullName).toBe('john doe');
    expect(result.data?.id).toBe('P1fJ3');
  });

  it('should call execute method when not valid email are provided', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(false);

    const error = await createPersonUserUseCase
      .execute({
        email: '',
        firstName: 'john',
        lastName: 'doe',
        userId: 'P1fJ3',
        createdAt: 12121212121212,
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_EMAIL,
      statusCode: 400,
    });

    expect(personUserServiceMock.createPersonUser).not.toHaveBeenCalled();
  });

  it('should call execute method when the user already exist.', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(true);

    personUserServiceMock.createPersonUser.mockResolvedValue({
      id: 'P1fJ3',
      fullName: 'john doe',
    });

    personUserServiceMock.getPersonUserByEmail.mockResolvedValue({
      email: 'jonh.doe@example.com',
      userId: 'P1fJ3',
      id: 'P1fJ3',
      firstName: 'jonh',
      lastName: 'doe',
      image: 'htpp://image',
      fullName: 'jonh doe',
      createdAt: 1212,
      updatedAt: 1212,
    });

    const error = await createPersonUserUseCase
      .execute({
        email: 'jonh.doe@example.com',
        firstName: 'john',
        lastName: 'doe',
        userId: 'P1fJ3',
        createdAt: 12121212121212,
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.EMAIL_ALREADY_IN_USE,
      statusCode: 400,
    });

    expect(personUserServiceMock.createPersonUser).not.toHaveBeenCalled();
  });

  it('should be return null when the createPersonUser repository to send the response without "id"', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(true);

    personUserServiceMock.createPersonUser.mockResolvedValue({
      fullName: 'john doe',
    });

    personUserServiceMock.getPersonUserByEmail.mockResolvedValue(null);

    const result = await createPersonUserUseCase.execute({
      email: 'jonh.doe@example.com',
      firstName: 'john',
      lastName: 'doe',
      userId: 'P1fJ3',
      createdAt: 12121212121212,
    });

    expect(result.data).toBeNull();
  });
});
