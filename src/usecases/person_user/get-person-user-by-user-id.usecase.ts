import { OutputDTO } from '@/domain/dtos/output.dto';
import { PersonUserEntitieDTO } from '@/domain/Person_User/dtos/person-user.dto';
import { Usecase } from '../usecase';
import { PersonUserServiceGateway } from '@/domain/Person_User/gateway/person-user.service.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type GetPersonUserByUserIdInputDTO = Pick<
  PersonUserEntitieDTO,
  'userId'
>;

export type GetPersonUserByUserIdOutputDTO =
  OutputDTO<PersonUserEntitieDTO | null>;

export class GetPersonUserByUserIdlUseCase
  implements
    Usecase<GetPersonUserByUserIdInputDTO, GetPersonUserByUserIdOutputDTO>
{
  private constructor(
    private readonly personUserService: PersonUserServiceGateway,
  ) {}

  public static create({
    personUserService,
  }: {
    personUserService: PersonUserServiceGateway;
  }) {
    return new GetPersonUserByUserIdlUseCase(personUserService);
  }

  public async execute({ userId }: GetPersonUserByUserIdInputDTO) {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const personUser = await this.personUserService.getPersonUserByUserId({
      userId,
    });

    if (!personUser || !personUser?.id) {
      return { data: null };
    }

    return {
      data: {
        id: personUser.id,
        userId: personUser.userId,
        firstName: personUser.firstName,
        lastName: personUser.lastName,
        fullName: personUser.fullName,
        email: personUser.email,
        image: personUser.image,
        createdAt: personUser.createdAt,
        updatedAt: personUser.updatedAt,
      },
    };
  }
}
