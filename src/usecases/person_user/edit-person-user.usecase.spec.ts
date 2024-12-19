import { PersonUserGateway } from '@/domain/Person_User/gateway/person_user.gateway';
import { EditPersonUserUseCase } from './edit-person-user.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

let personUserGatewayMock: jest.Mocked<PersonUserGateway>;
describe('Edit Person User Usecase', () => {
  let editPersonUserUseCase: EditPersonUserUseCase;

  beforeEach(() => {
    personUserGatewayMock = {
      getPersonUserByEmail: jest.fn(),
      createPersonUser: jest.fn(),
      getPersonUserById: jest.fn(),
      editPersonUser: jest.fn(),
      deletePersonUser: jest.fn(),
    };

    editPersonUserUseCase = EditPersonUserUseCase.create({
      personUserGateway: personUserGatewayMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be create a instance of the EditPersonUserUseCase class when will be use create method.', () => {
    expect(editPersonUserUseCase).toBeInstanceOf(EditPersonUserUseCase);
  });

  it('should be call execute method when valid personId and personData are provided.', async () => {
    personUserGatewayMock.editPersonUser.mockResolvedValue({
      userId: 'PnAvaiVeApVMDZz21lKG94gU1fJ3',
      firstName: 'John',
      lastName: 'Doe',
      email: 'jonh.doe@example.com',
      image: 'https://example.com/profile.jpg',
      fullName: 'Jonh Doe',
      id: '1666',
      createdAt: 121222222222222,
      updatedAt: 122222222222223,
    });

    personUserGatewayMock.getPersonUserById.mockResolvedValue({
      userId: 'PnAvaiVeApVMDZz21lKG94gU1fJ3',
      firstName: 'John',
      lastName: 'Doe',
      email: 'jonh.doe@example.com',
      image: 'https://example.com/profile.jpg',
      fullName: 'Jonh Doe',
      id: '1666',
      createdAt: 121222222222222,
      updatedAt: 122222222222223,
    });

    const result = await editPersonUserUseCase.execute({
      personId: '1666',
      personData: {
        userId: 'PnAvaiVeApVMDZz21lKG94gU1fJ3',
        firstName: 'John',
        lastName: 'Doe',
        email: 'jonh.doe@example.com',
        image: 'https://example.com/profile.jpg',
        fullName: 'Jonh Doe',
        id: '1666',
        createdAt: 121222222222222,
        updatedAt: 122222222222223,
      },
    });

    expect(personUserGatewayMock.editPersonUser).toHaveBeenLastCalledWith({
      personId: '1666',
      personData: {
        userId: 'PnAvaiVeApVMDZz21lKG94gU1fJ3',
        firstName: 'John',
        lastName: 'Doe',
        email: 'jonh.doe@example.com',
        image: 'https://example.com/profile.jpg',
        fullName: 'Jonh Doe',
        id: '1666',
        createdAt: 121222222222222,
        updatedAt: 122222222222223,
      },
    });

    if (!result.data) {
      throw new Error('Result data should not be null');
    }

    expect(result.data).not.toBeNull();
    expect(result.data.fullName).toBe('Jonh Doe');
    expect(result.data.id).toBe('1666');
  });

  it('should call execute method when not valid personId are provided', async () => {
    const error = await editPersonUserUseCase
      .execute({
        personId: '',
        personData: {
          userId: 'PnAvaiVeApVMDZz21lKG94gU1fJ3',
          firstName: 'John',
          lastName: 'Doe',
          email: 'jonh.doe@example.com',
          image: 'https://example.com/profile.jpg',
          fullName: 'Jonh Doe',
          id: '1666',
          createdAt: 121222222222222,
          updatedAt: 122222222222223,
        },
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });

    expect(personUserGatewayMock.editPersonUser).not.toHaveBeenCalled();
  });

  it('should call execute method when the user not exist.', async () => {
    personUserGatewayMock.getPersonUserById.mockResolvedValue(null);

    const error = await editPersonUserUseCase
      .execute({
        personId: '1666',
        personData: {
          userId: 'PnAvaiVeApVMDZz21lKG94gU1fJ3',
          firstName: 'John',
          lastName: 'Doe',
          email: 'jonh.doe@example.com',
          image: 'https://example.com/profile.jpg',
          fullName: 'Jonh Doe',
          id: '1666',
          createdAt: 121222222222222,
          updatedAt: 122222222222223,
        },
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.USER_NOT_FOUND,
      statusCode: 404,
    });

    expect(personUserGatewayMock.editPersonUser).not.toHaveBeenCalled();
  });
});
