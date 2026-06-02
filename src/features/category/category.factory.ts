import { Firestore } from 'firebase-admin/firestore';
import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { crypto } from '@/packages/clients/crypto';
import { CategoryRepositoryFirestore } from '@/features/category/infra/persistence/category.repository.firestore';
import { ListCategoriesByTypeUseCase } from '@/features/category/application/list-categories-by-type.usecase';
import { GetCategoryByEnumUseCase } from '@/features/category/application/get-category-by-enum.usecase';
import { ListGroupsByTypeUseCase } from '@/features/category/application/list-groups-by-type.usecase';
import { ListCategoriesByGroupUseCase } from '@/features/category/application/list-categories-by-group.usecase';
import { CreateCategoryUseCase } from '@/features/category/application/create-category.usecase';
import { EditCategoryUseCase } from '@/features/category/application/edit-category.usecase';
import { DeleteCategoryUseCase } from '@/features/category/application/delete-category.usecase';
import { CategoryController } from '@/features/category/infra/http/category.controller';
import { categoryRoutes } from '@/features/category/infra/http/category.routes';

export interface CategoryModuleDeps {
  db: Firestore;
  // Slot plugável: vira o gate 403 na história de role; ausente = escrita livre.
  writeGuard?: Middleware;
  generateId?: () => string;
  now?: () => string;
}

export interface CategoryModule {
  routes: Route[];
  reads: {
    getByEnum: GetCategoryByEnumUseCase;
    listByType: ListCategoriesByTypeUseCase;
  };
}

export function makeCategoryModule(deps: CategoryModuleDeps): CategoryModule {
  const generateId = deps.generateId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date().toISOString());

  const repository = CategoryRepositoryFirestore.create(deps.db);

  const listByType = ListCategoriesByTypeUseCase.create(repository);
  const getByEnum = GetCategoryByEnumUseCase.create(repository);
  const listGroups = ListGroupsByTypeUseCase.create(repository);
  const listByGroup = ListCategoriesByGroupUseCase.create(repository);
  const create = CreateCategoryUseCase.create(repository, generateId, now);
  const edit = EditCategoryUseCase.create(repository, now);
  const remove = DeleteCategoryUseCase.create(repository, now);

  const controller = CategoryController.create({
    listByType,
    getByEnum,
    listGroups,
    listByGroup,
    create,
    edit,
    remove,
  });

  return {
    routes: categoryRoutes(controller, deps.writeGuard),
    reads: { getByEnum, listByType },
  };
}
