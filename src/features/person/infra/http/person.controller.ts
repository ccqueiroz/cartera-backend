import type { Request, Response } from 'express';
import {
  assertValid,
  DROP_UNKNOWN,
  userIdFrom,
} from '@/shared/http/request-input';
import { GetOwnPersonUseCase } from '@/features/person/application/get-own-person.usecase';
import { UpdateOwnPersonUseCase } from '@/features/person/application/update-own-person.usecase';
import { DeleteOwnPersonUseCase } from '@/features/person/application/delete-own-person.usecase';
import { ReplaceAvatarUseCase } from '@/features/person/application/replace-avatar.usecase';
import { RemoveAvatarUseCase } from '@/features/person/application/remove-avatar.usecase';
import { UpdatePersonSchema } from '@/features/person/infra/http/schemas/update-person.schema';
import { ReplaceAvatarSchema } from '@/features/person/infra/http/schemas/replace-avatar.schema';
import { parseAvatarImage } from '@/features/person/infra/http/avatar-image.parser';

export interface PersonUseCases {
  getOwn: GetOwnPersonUseCase;
  updateOwn: UpdateOwnPersonUseCase;
  deleteOwn: DeleteOwnPersonUseCase;
  replaceAvatar: ReplaceAvatarUseCase;
  removeAvatar: RemoveAvatarUseCase;
}

export class PersonController {
  private constructor(private readonly useCases: PersonUseCases) {}

  public static create(useCases: PersonUseCases): PersonController {
    return new PersonController(useCases);
  }

  public getOwn = async (req: Request, res: Response): Promise<void> => {
    const person = await this.useCases.getOwn.execute({
      userId: userIdFrom(req),
    });
    res.status(200).json({ data: person.toOutput() });
  };

  public updateOwn = async (req: Request, res: Response): Promise<void> => {
    await assertValid(UpdatePersonSchema, req.body, DROP_UNKNOWN);
    const person = await this.useCases.updateOwn.execute({
      userId: userIdFrom(req),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      document: req.body.document,
      birthDate: req.body.birthDate,
      occupation: req.body.occupation,
      monthlyIncome: req.body.monthlyIncome,
      defaultCurrency: req.body.defaultCurrency,
    });
    res.status(200).json({ data: person.toOutput() });
  };

  public deleteOwn = async (req: Request, res: Response): Promise<void> => {
    await this.useCases.deleteOwn.execute({ userId: userIdFrom(req) });
    res.status(204).send();
  };

  public replaceAvatar = async (req: Request, res: Response): Promise<void> => {
    await assertValid(ReplaceAvatarSchema, req.body, DROP_UNKNOWN);
    const { buffer, contentType } = parseAvatarImage(String(req.body.image));
    const person = await this.useCases.replaceAvatar.execute({
      userId: userIdFrom(req),
      buffer,
      contentType,
    });
    res.status(200).json({ data: person.toOutput() });
  };

  public removeAvatar = async (req: Request, res: Response): Promise<void> => {
    await this.useCases.removeAvatar.execute({ userId: userIdFrom(req) });
    res.status(204).send();
  };
}
