import type { Request, Response } from 'express';
import {
  ClassConstructor,
  runValidate,
} from '@/packages/clients/class-validator';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { ListCategoriesByTypeUseCase } from '@/features/category/application/list-categories-by-type.usecase';
import { GetCategoryByEnumUseCase } from '@/features/category/application/get-category-by-enum.usecase';
import { ListGroupsByTypeUseCase } from '@/features/category/application/list-groups-by-type.usecase';
import { ListCategoriesByGroupUseCase } from '@/features/category/application/list-categories-by-group.usecase';
import { CreateCategoryUseCase } from '@/features/category/application/create-category.usecase';
import { EditCategoryUseCase } from '@/features/category/application/edit-category.usecase';
import { DeleteCategoryUseCase } from '@/features/category/application/delete-category.usecase';
import { TypeQuerySchema } from '@/features/category/infra/http/schemas/type-query.schema';
import { DescriptionEnumParamSchema } from '@/features/category/infra/http/schemas/description-enum-param.schema';
import { GroupParamSchema } from '@/features/category/infra/http/schemas/group-param.schema';
import { CreateCategorySchema } from '@/features/category/infra/http/schemas/create-category.schema';
import { EditCategorySchema } from '@/features/category/infra/http/schemas/edit-category.schema';
import { CategoryDescription } from '@/features/category/domain/enums/category-description.enum';
import { CategoryGroup } from '@/features/category/domain/enums/category-group.enum';
import { TransactionType } from '@/shared/kernel/enums/transaction-type.enum';

async function assertValid<T extends object>(
  schema: ClassConstructor<T>,
  input: unknown,
): Promise<void> {
  const errors = await runValidate(schema, input, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .filter(Boolean)
      .join('; ');
    throw new ValidationError(
      ErrorCode.VALIDATION_FAILED,
      details ? { details } : undefined,
    );
  }
}

export interface CategoryUseCases {
  listByType: ListCategoriesByTypeUseCase;
  getByEnum: GetCategoryByEnumUseCase;
  listGroups: ListGroupsByTypeUseCase;
  listByGroup: ListCategoriesByGroupUseCase;
  create: CreateCategoryUseCase;
  edit: EditCategoryUseCase;
  remove: DeleteCategoryUseCase;
}

export class CategoryController {
  private constructor(private readonly useCases: CategoryUseCases) {}

  public static create(useCases: CategoryUseCases): CategoryController {
    return new CategoryController(useCases);
  }

  public listAll = async (req: Request, res: Response): Promise<void> => {
    await assertValid(TypeQuerySchema, req.query);
    const result = await this.useCases.listByType.execute({
      type: String(req.query.type),
    });
    res.status(200).json(result);
  };

  public getByEnum = async (req: Request, res: Response): Promise<void> => {
    await assertValid(DescriptionEnumParamSchema, req.params);
    const result = await this.useCases.getByEnum.execute({
      descriptionEnum: String(req.params.descriptionEnum),
    });
    res.status(200).json(result);
  };

  public listGroups = async (req: Request, res: Response): Promise<void> => {
    await assertValid(TypeQuerySchema, req.query);
    const result = await this.useCases.listGroups.execute({
      type: String(req.query.type),
    });
    res.status(200).json(result);
  };

  public listByGroups = async (req: Request, res: Response): Promise<void> => {
    await assertValid(GroupParamSchema, req.params);
    await assertValid(TypeQuerySchema, req.query);
    const result = await this.useCases.listByGroup.execute({
      group: String(req.params.group),
      type: String(req.query.type),
    });
    res.status(200).json(result);
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    await assertValid(CreateCategorySchema, req.body);
    const result = await this.useCases.create.execute({
      description: req.body.description,
      descriptionEnum: req.body.descriptionEnum as CategoryDescription,
      group: req.body.group as CategoryGroup,
      type: req.body.type as TransactionType,
    });
    res.status(result.reactivated ? 200 : 201).json(result.category.toOutput());
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    await assertValid(DescriptionEnumParamSchema, req.params);
    await assertValid(EditCategorySchema, req.body);
    const category = await this.useCases.edit.execute({
      descriptionEnum: req.params.descriptionEnum as CategoryDescription,
      description: req.body.description,
      group: req.body.group as CategoryGroup,
      type: req.body.type as TransactionType,
      requestedDescriptionEnum: req.body.descriptionEnum,
    });
    res.status(200).json(category.toOutput());
  };

  public remove = async (req: Request, res: Response): Promise<void> => {
    await assertValid(DescriptionEnumParamSchema, req.params);
    await this.useCases.remove.execute({
      descriptionEnum: req.params.descriptionEnum as CategoryDescription,
    });
    res.status(204).send();
  };
}
