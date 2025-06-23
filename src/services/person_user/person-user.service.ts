import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import {
  CreatePersonUserOutputDTO,
  EditPersonUserDTO,
  EditPersonUserOutputDTO,
  PersonUserEntitieDTO,
} from '@/domain/Person_User/dtos/person-user.dto';
import { PersonUserRepositoryGateway } from '@/domain/Person_User/gateway/person-user.repository.gateway';
import { PersonUserServiceGateway } from '@/domain/Person_User/gateway/person-user.service.gateway';

export class PersonUserService implements PersonUserServiceGateway {
  private static instance: PersonUserService;
  private keyController = 'person-user';
  private TTL_DEFAULT = 20 * 60; // 20 minutes;

  private constructor(
    private readonly db: PersonUserRepositoryGateway,
    private readonly cache: CacheGateway,
  ) {}

  public static create(db: PersonUserRepositoryGateway, cache: CacheGateway) {
    if (!PersonUserService.instance) {
      PersonUserService.instance = new PersonUserService(db, cache);
    }

    return PersonUserService.instance;
  }

  private async findKeysPersonUser(key: string): Promise<Array<string>> {
    let cursor = 0;
    const keys: Array<string> = [];

    do {
      const { cursor: nextCursor, keys: keysReturn } = await this.cache.scan(
        +cursor,
        key,
      );

      cursor = Number(nextCursor);

      keys.push(...keysReturn);
    } while (cursor !== 0);

    return keys;
  }

  private async recoverPersonUserData(
    keys: Array<string>,
  ): Promise<PersonUserEntitieDTO | null> {
    let personUser: PersonUserEntitieDTO | null;

    if (keys.length === 0) {
      personUser = null;
    } else if (keys.length > 1) {
      personUser = null;
      await this.cache.delete(keys);
    } else {
      personUser = await this.cache.recover<PersonUserEntitieDTO | null>(
        keys[0],
      );
    }

    return personUser;
  }

  private async savePersonUserData(
    data: PersonUserEntitieDTO | null,
  ): Promise<void> {
    if (data) {
      const keyToSave = `${this.keyController}/${data.email}/${data.id}/${data.userId}`;

      await this.cache.save<PersonUserEntitieDTO>(
        keyToSave,
        data,
        this.TTL_DEFAULT,
      );
    }
  }

  public async getPersonUserByEmail({
    email,
  }: Pick<
    PersonUserEntitieDTO,
    'email'
  >): Promise<PersonUserEntitieDTO | null> {
    const key = `${this.keyController}/${email ?? ''}/*/*`;

    const findKeys = await this.findKeysPersonUser(key);

    const personUserCache = await this.recoverPersonUserData(findKeys);

    if (personUserCache) {
      return personUserCache;
    }

    const personUserDb = await this.db.getPersonUserByEmail({ email });

    await this.savePersonUserData(personUserDb);

    return personUserDb;
  }

  public async getPersonUserById({
    id,
  }: Pick<PersonUserEntitieDTO, 'id'>): Promise<PersonUserEntitieDTO | null> {
    const key = `${this.keyController}/*/${id ?? ''}/*`;

    const findKeys = await this.findKeysPersonUser(key);

    const personUserCache = await this.recoverPersonUserData(findKeys);

    if (personUserCache) {
      return personUserCache;
    }

    const personUserDb = await this.db.getPersonUserById({ id });

    await this.savePersonUserData(personUserDb);

    return personUserDb;
  }

  async getPersonUserByUserId({
    userId,
  }: Pick<
    PersonUserEntitieDTO,
    'userId'
  >): Promise<PersonUserEntitieDTO | null> {
    const key = `${this.keyController}/*/*/${userId ?? ''}`;

    const findKeys = await this.findKeysPersonUser(key);

    const personUserCache = await this.recoverPersonUserData(findKeys);

    if (personUserCache) {
      return personUserCache;
    }

    const personUserDb = await this.db.getPersonUserByUserId({ userId });

    await this.savePersonUserData(personUserDb);

    return personUserDb;
  }

  public async createPersonUser({
    email,
    userId,
    firstName,
    lastName,
    createdAt,
  }: Pick<
    PersonUserEntitieDTO,
    'email' | 'firstName' | 'lastName' | 'userId' | 'createdAt'
  >): Promise<CreatePersonUserOutputDTO | null> {
    const personUser = await this.db.createPersonUser({
      email,
      userId,
      firstName,
      lastName,
      createdAt,
    });

    if (personUser?.id) {
      await this.savePersonUserData({
        ...personUser,
        email,
        userId,
        firstName,
        lastName,
        createdAt,
        image: null,
        updatedAt: null,
      });
    }

    return personUser;
  }

  public async editPersonUser({
    personId,
    personData,
  }: EditPersonUserDTO): Promise<EditPersonUserOutputDTO> {
    const personUser = await this.db.editPersonUser({ personId, personData });

    await this.savePersonUserData(personUser);

    return personUser;
  }

  public async deletePersonUser({
    id,
  }: Pick<PersonUserEntitieDTO, 'id'>): Promise<void> {
    await this.db.deletePersonUser({ id });

    const key = `${this.keyController}/*/${id ?? ''}`;

    const findKeys = await this.findKeysPersonUser(key);

    await this.cache.delete(findKeys);
  }
}
