import { MapRoutes, Route } from '../route';
import { Middleware } from '../../middlewares/middleware';
import { GetCategoriesUseCase } from '@/usecases/category/get-categories.usecase';
import { GetCategoriesRoute } from './get-categories.route';
import { GetCategoryByIdUseCase } from '@/usecases/category/get-category-by-id.usecase';
import { GetCategoryByIdRoute } from './get-category-by-id.route';
import { CategoryService } from '@/services/category.service';

export class CategoryRoute implements MapRoutes {
  private constructor(
    private readonly categoryService: CategoryService,
    private readonly authVerifyMiddleware: Middleware,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    categoryService: CategoryService,
    authVerifyMiddleware: Middleware,
  ) {
    return new CategoryRoute(categoryService, authVerifyMiddleware);
  }

  private factoryGetCategories() {
    const getCategoriesService = GetCategoriesUseCase.create({
      categoryService: this.categoryService,
    });
    const getCategoriesRoute = GetCategoriesRoute.create(getCategoriesService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
    this.routes.push(getCategoriesRoute);
  }

  private factoryGetCategoryById() {
    const getCategoryByIdService = GetCategoryByIdUseCase.create({
      categoryService: this.categoryService,
    });
    const getCategoryByIdRoute = GetCategoryByIdRoute.create(
      getCategoryByIdService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getCategoryByIdRoute);
  }

  private joinRoutes() {
    this.factoryGetCategories();
    this.factoryGetCategoryById();
  }

  public execute() {
    return this.routes;
  }
}
