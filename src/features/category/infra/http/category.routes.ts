import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';
import { ListCategoriesByTypeRoute } from '@/features/category/infra/http/list-categories-by-type.route';
import { GetCategoryByEnumRoute } from '@/features/category/infra/http/get-category-by-enum.route';
import { ListGroupsByTypeRoute } from '@/features/category/infra/http/list-groups-by-type.route';
import { ListCategoriesByGroupRoute } from '@/features/category/infra/http/list-categories-by-group.route';
import { CreateCategoryRoute } from '@/features/category/infra/http/create-category.route';
import { UpdateCategoryRoute } from '@/features/category/infra/http/update-category.route';
import { DeleteCategoryRoute } from '@/features/category/infra/http/delete-category.route';

export function categoryRoutes(
  controller: CategoryController,
  authMiddleware: Middleware,
): Route[] {
  const authenticated = [authMiddleware];

  return [
    ListCategoriesByTypeRoute.create(controller, authenticated),
    GetCategoryByEnumRoute.create(controller, authenticated),
    ListGroupsByTypeRoute.create(controller, authenticated),
    ListCategoriesByGroupRoute.create(controller, authenticated),
    CreateCategoryRoute.create(controller, authenticated),
    UpdateCategoryRoute.create(controller, authenticated),
    DeleteCategoryRoute.create(controller, authenticated),
  ];
}
