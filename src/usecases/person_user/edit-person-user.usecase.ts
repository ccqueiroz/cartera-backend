import { OutputDTO } from '@/domain/dtos/output.dto';
import {
  EditPersonUserDTO,
  EditPersonUserOutputDTO as TypeEditPersonUserOutputDTO,
} from '@/domain/Person_User/dtos/person-user.dto';
import { Usecase } from '../usecase';
import { PersonUserServiceGateway } from '@/domain/Person_User/gateway/person-user.service.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type EditPersonUserInputDTO = EditPersonUserDTO;

export type EditPersonUserOutputDTO =
  OutputDTO<TypeEditPersonUserOutputDTO | null>;

export class EditPersonUserUseCase
  implements Usecase<EditPersonUserInputDTO, EditPersonUserOutputDTO>
{
  private constructor(
    private readonly personUserService: PersonUserServiceGateway,
  ) {}

  public static create({
    personUserService,
  }: {
    personUserService: PersonUserServiceGateway;
  }) {
    return new EditPersonUserUseCase(personUserService);
  }

  public async execute({
    personId,
    personData,
  }: EditPersonUserDTO): Promise<EditPersonUserOutputDTO> {
    if (!personId) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const hasPersonUser = await this.personUserService.getPersonUserById({
      id: personId,
    });

    if (!hasPersonUser) {
      throw new ApiError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    const personUser = await this.personUserService.editPersonUser({
      personId,
      personData,
    });

    return {
      data: {
        id: personUser.id,
        userId: personUser.userId,
        firstName: personUser.firstName,
        lastName: personUser.lastName,
        fullName: personUser.fullName,
        email: personUser.email,
        image: personUser?.image ?? null,
        createdAt: personUser.createdAt,
        updatedAt: personUser.updatedAt,
      },
    };
  }
}
