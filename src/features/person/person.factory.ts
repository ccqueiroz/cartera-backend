import { Firestore } from 'firebase-admin/firestore';
import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { LoggerGateway } from '@/shared/logger/logger.gateway';
import { crypto } from '@/packages/clients/crypto';
import { AuthGateway } from '@/features/person/domain/ports/auth.gateway.port';
import { StorageGateway } from '@/features/person/domain/ports/storage.gateway.port';
import { PersonRepositoryFirestore } from '@/features/person/infra/persistence/person.repository.firestore';
import { CreatePersonUseCase } from '@/features/person/application/create-person.usecase';
import { GetOwnPersonUseCase } from '@/features/person/application/get-own-person.usecase';
import { UpdateOwnPersonUseCase } from '@/features/person/application/update-own-person.usecase';
import { DeleteOwnPersonUseCase } from '@/features/person/application/delete-own-person.usecase';
import { ReplaceAvatarUseCase } from '@/features/person/application/replace-avatar.usecase';
import { RemoveAvatarUseCase } from '@/features/person/application/remove-avatar.usecase';
import { FindPersonByEmailUseCase } from '@/features/person/application/find-person-by-email.usecase';
import { FindPersonByUserIdUseCase } from '@/features/person/application/find-person-by-user-id.usecase';
import { FindPersonByUserIdIncludingDeletedUseCase } from '@/features/person/application/find-person-by-user-id-including-deleted.usecase';
import { SyncPersonEmailUseCase } from '@/features/person/application/sync-person-email.usecase';
import { PersonController } from '@/features/person/infra/http/person.controller';
import { personRoutes } from '@/features/person/infra/http/person.routes';

export interface PersonModuleDeps {
  db: Firestore;
  logger: LoggerGateway;
  authMiddleware: Middleware;
  authGateway: AuthGateway;
  storageGateway: StorageGateway;
  generateId?: () => string;
  now?: () => string;
}

export interface PersonModule {
  routes: Route[];
  /** Contratos internos (UC1/UC7) para o futuro auth consumir via porta — sem rota HTTP. */
  internal: {
    createPerson: CreatePersonUseCase;
    findPersonByEmail: FindPersonByEmailUseCase;
    findPersonByUserId: FindPersonByUserIdUseCase;
    findPersonByUserIdIncludingDeleted: FindPersonByUserIdIncludingDeletedUseCase;
    syncPersonEmail: SyncPersonEmailUseCase;
  };
}

export function makePersonModule(deps: PersonModuleDeps): PersonModule {
  const generateId = deps.generateId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date().toISOString());

  const repository = PersonRepositoryFirestore.create(deps.db);

  const getOwn = GetOwnPersonUseCase.create(repository, deps.authGateway);
  const updateOwn = UpdateOwnPersonUseCase.create(repository, now);
  const replaceAvatar = ReplaceAvatarUseCase.create(
    repository,
    deps.storageGateway,
    deps.logger,
    now,
  );
  const removeAvatar = RemoveAvatarUseCase.create(
    repository,
    deps.storageGateway,
    deps.logger,
    now,
  );
  const deleteOwn = DeleteOwnPersonUseCase.create(
    repository,
    deps.authGateway,
    now,
  );

  const controller = PersonController.create({
    getOwn,
    updateOwn,
    deleteOwn,
    replaceAvatar,
    removeAvatar,
  });

  return {
    routes: personRoutes(controller, deps.authMiddleware),
    internal: {
      createPerson: CreatePersonUseCase.create(repository, generateId, now),
      findPersonByEmail: FindPersonByEmailUseCase.create(repository),
      findPersonByUserId: FindPersonByUserIdUseCase.create(repository),
      findPersonByUserIdIncludingDeleted:
        FindPersonByUserIdIncludingDeletedUseCase.create(repository),
      syncPersonEmail: SyncPersonEmailUseCase.create(repository, now),
    },
  };
}
