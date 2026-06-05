import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PersonController } from '@/features/person/infra/http/person.controller';
import { GetOwnPersonRoute } from '@/features/person/infra/http/get-own-person.route';
import { UpdateOwnPersonRoute } from '@/features/person/infra/http/update-own-person.route';
import { DeleteOwnPersonRoute } from '@/features/person/infra/http/delete-own-person.route';
import { ReplaceAvatarRoute } from '@/features/person/infra/http/replace-avatar.route';
import { RemoveAvatarRoute } from '@/features/person/infra/http/remove-avatar.route';

export function personRoutes(
  controller: PersonController,
  authMiddleware: Middleware,
): Route[] {
  const authenticated = [authMiddleware];

  return [
    GetOwnPersonRoute.create(controller, authenticated),
    UpdateOwnPersonRoute.create(controller, authenticated),
    DeleteOwnPersonRoute.create(controller, authenticated),
    ReplaceAvatarRoute.create(controller, authenticated),
    RemoveAvatarRoute.create(controller, authenticated),
  ];
}
