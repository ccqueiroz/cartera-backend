import { EditPersonUserUseCase } from './edit-person-user.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { PersonUserServiceGateway } from '@/domain/Person_User/gateway/person-user.service.gateway';

let personUserServiceMock: jest.Mocked<PersonUserServiceGateway>;
describe('Edit Person User Usecase', () => {
  let editPersonUserUseCase: EditPersonUserUseCase;

  beforeEach(() => {
    personUserServiceMock = {
      getPersonUserById: jest.fn(),
      editPersonUser: jest.fn(),
    } as any;

    editPersonUserUseCase = EditPersonUserUseCase.create({
      personUserService: personUserServiceMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be create a instance of the EditPersonUserUseCase class when will be use create method.', () => {
    expect(editPersonUserUseCase).toBeInstanceOf(EditPersonUserUseCase);
  });

  it('should be call execute method when valid personId and personData are provided.', async () => {
    personUserServiceMock.editPersonUser.mockResolvedValue({
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

    personUserServiceMock.getPersonUserById.mockResolvedValue({
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

    expect(personUserServiceMock.editPersonUser).toHaveBeenLastCalledWith({
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

    expect(personUserServiceMock.editPersonUser).not.toHaveBeenCalled();
  });

  it('should call execute method when the user not exist.', async () => {
    personUserServiceMock.getPersonUserById.mockResolvedValue(null);

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

    expect(personUserServiceMock.editPersonUser).not.toHaveBeenCalled();
  });
});
