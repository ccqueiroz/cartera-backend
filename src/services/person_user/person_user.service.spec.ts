import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { PersonUserRepositoryGateway } from '@/domain/Person_User/gateway/person-user.repository.gateway';
import { PersonUserService } from './person-user.service';

let dbMock: jest.Mocked<PersonUserRepositoryGateway>;
let cacheMock: jest.Mocked<CacheGateway>;

describe('Person User Service', () => {
  let personUSerService: PersonUserService;

  const keyController = 'person-user';

  beforeEach(() => {
    jest.clearAllMocks();

    dbMock = {
      getPersonUserById: jest.fn(),
      getPersonUserByEmail: jest.fn(),
      createPersonUser: jest.fn(),
      editPersonUser: jest.fn(),
      deletePersonUser: jest.fn(),
    };

    cacheMock = {
      recover: jest.fn(),
      save: jest.fn(),
      scan: jest.fn(),
      delete: jest.fn(),
      deleteWithPattern: jest.fn(),
    } as any;

    personUSerService = PersonUserService.create(dbMock, cacheMock);
  });

  afterEach(() => {
    (PersonUserService as any).instance = undefined;
  });

  it('should be create a instance of the PersonUserService class when will be use create method', () => {
    expect(personUSerService).toBeInstanceOf(PersonUserService);
  });

  it('should be call getPersonUserById and return data from db', async () => {
    const data = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      fullName: 'Jonh Doe',
    };

    const input = { id: data.id };

    const key = `${keyController}/*/${data.id}`;

    cacheMock.recover.mockResolvedValue(null);
    cacheMock.scan.mockResolvedValueOnce({
      cursor: 0,
      keys: [],
    });

    dbMock.getPersonUserById.mockResolvedValue(data);

    const result = await personUSerService.getPersonUserById(input);

    expect(cacheMock.scan).toHaveBeenCalled();
    expect(cacheMock.scan).toHaveBeenCalledWith(0, key);
    expect(cacheMock.recover).not.toHaveBeenCalled();
    expect(dbMock.getPersonUserById).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call getPersonUserById and verify if exist registered keys in cache provider and in case exist registereds keys, must be return data from cache.', async () => {
    const data = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      fullName: 'Jonh Doe',
    };

    const input = { id: data.id };

    const key = `${keyController}/*/${data.id}`;
    const keyFromScan = `${keyController}/${data.email}/${data.id}`;

    cacheMock.recover.mockResolvedValue(data);
    cacheMock.scan.mockResolvedValueOnce({
      cursor: 0,
      keys: [keyFromScan],
    });

    const result = await personUSerService.getPersonUserById(input);

    expect(cacheMock.scan).toHaveBeenCalled();
    expect(cacheMock.scan).toHaveBeenCalledWith(0, key);
    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(keyFromScan);
    expect(dbMock.getPersonUserById).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be verify how many keys has registered in cache provider, so if exists more than 1 key, must be return null to cache data and delete all related search keys', async () => {
    const data = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      fullName: 'Jonh Doe',
    };

    const input = { id: data.id };

    const key = `${keyController}/*/${data.id}`;
    const keyFromScan = `${keyController}/${data.email}/${data.id}`;

    cacheMock.recover.mockResolvedValue(data);
    cacheMock.scan.mockResolvedValueOnce({
      cursor: 0,
      keys: [keyFromScan, keyFromScan],
    });
    dbMock.getPersonUserById.mockResolvedValue(data);

    await personUSerService.getPersonUserById(input);

    expect(cacheMock.scan).toHaveBeenCalled();
    expect(cacheMock.scan).toHaveBeenCalledWith(0, key);
    expect(cacheMock.delete).toHaveBeenCalled();
    expect(cacheMock.delete).toHaveBeenCalledWith([keyFromScan, keyFromScan]);
    expect(cacheMock.recover).not.toHaveBeenCalled();
    expect(dbMock.getPersonUserById).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalled();
  });

  it('should be verify how many keys has registered in cache provider, so if dont exists keys, must be return null to cache data and call getPersonUserById from db provider.', async () => {
    const data = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      fullName: 'Jonh Doe',
    };

    const input = { id: data.id };

    const key = `${keyController}/*/${data.id}`;

    cacheMock.recover.mockResolvedValue(null);
    cacheMock.scan.mockResolvedValueOnce({
      cursor: 0,
      keys: [],
    });
    dbMock.getPersonUserById.mockResolvedValue(data);

    await personUSerService.getPersonUserById(input);

    expect(cacheMock.scan).toHaveBeenCalled();
    expect(cacheMock.scan).toHaveBeenCalledWith(0, key);
    expect(cacheMock.delete).not.toHaveBeenCalled();
    expect(cacheMock.recover).not.toHaveBeenCalled();
    expect(dbMock.getPersonUserById).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalled();
  });

  it('should be call save method from cache provider with formatted key "person-user/email/id".', async () => {
    const data = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      fullName: 'Jonh Doe',
    };

    const input = { id: data.id };

    const key = `${keyController}/*/${data.id}`;
    const keyFromScan = `${keyController}/${data.email}/${data.id}`;

    cacheMock.recover.mockResolvedValue(null);
    cacheMock.scan.mockResolvedValueOnce({
      cursor: 0,
      keys: [keyFromScan],
    });
    dbMock.getPersonUserById.mockResolvedValue(data);

    await personUSerService.getPersonUserById(input);

    expect(cacheMock.scan).toHaveBeenCalled();
    expect(cacheMock.scan).toHaveBeenCalledWith(0, key);
    expect(cacheMock.delete).not.toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalled();
    expect(dbMock.getPersonUserById).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalledWith(keyFromScan, data, 1200);
  });

  it('should be call getPersonUserByEmail and return data from db', async () => {
    const data = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      fullName: 'Jonh Doe',
    };

    const input = { email: data.email };

    const key = `${keyController}/${data.email}/*`;

    cacheMock.recover.mockResolvedValue(null);
    cacheMock.scan.mockResolvedValueOnce({
      cursor: 0,
      keys: [],
    });

    dbMock.getPersonUserByEmail.mockResolvedValue(data);

    const result = await personUSerService.getPersonUserByEmail(input);

    expect(cacheMock.scan).toHaveBeenCalled();
    expect(cacheMock.scan).toHaveBeenCalledWith(0, key);
    expect(cacheMock.recover).not.toHaveBeenCalled();
    expect(dbMock.getPersonUserByEmail).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call getPersonUserByEmail and verify if exist registered keys in cache provider and in case exist registereds keys, must be return data from cache.', async () => {
    const data = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      fullName: 'Jonh Doe',
    };

    const input = { email: data.email };

    const key = `${keyController}/${data.email}/*`;
    const keyFromScan = `${keyController}/${data.email}/${data.id}`;

    cacheMock.recover.mockResolvedValue(data);
    cacheMock.scan.mockResolvedValueOnce({
      cursor: 0,
      keys: [keyFromScan],
    });

    const result = await personUSerService.getPersonUserByEmail(input);

    expect(cacheMock.scan).toHaveBeenCalled();
    expect(cacheMock.scan).toHaveBeenCalledWith(0, key);
    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(keyFromScan);
    expect(dbMock.getPersonUserByEmail).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call createPersonUSer and to call the createPersonUser from db provider, and dont existing error, must be call save method from cache provider', async () => {
    const createdAt = new Date().getTime();
    const dataRequest = {
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt,
    };

    const dataResponse = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      fullName: 'Jonh Doe',
    };

    const dataToSave = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt,
      updatedAt: null,
      image: null,
      fullName: 'Jonh Doe',
    };

    const key = `${keyController}/${dataToSave.email}/${dataToSave.id}`;

    dbMock.createPersonUser.mockResolvedValue(dataResponse);

    const result = await personUSerService.createPersonUser(dataRequest);

    expect(dbMock.createPersonUser).toHaveBeenCalled();
    expect(dbMock.createPersonUser).toHaveBeenCalledWith(dataRequest);
    expect(cacheMock.save).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalledWith(key, dataToSave, 1200);
    expect(result).toEqual(dataResponse);
  });

  it('should be call createPersonUSer and to call the createPersonUser from db provider, and has error, must be dont call save method from cache provider', async () => {
    const createdAt = new Date().getTime();

    const dataRequest = {
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt,
    };

    const dataResponse = {
      id: undefined as any,
      fullName: 'Jonh Doe',
    };

    dbMock.createPersonUser.mockResolvedValue(dataResponse);

    const result = await personUSerService.createPersonUser(dataRequest);

    expect(dbMock.createPersonUser).toHaveBeenCalled();
    expect(dbMock.createPersonUser).toHaveBeenCalledWith(dataRequest);
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).toEqual(dataResponse);
  });

  it('should be call editPersonUser and to call the editPersonUser from db provider, and dont existing error, must be call save method from cache provider', async () => {
    const createdAt = new Date().getTime();
    const updatedAt = new Date().getTime();

    const dataRequest = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt,
      image: null,
      fullName: 'Jonh Doe',
      updatedAt: null,
    };

    const dataResponse = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      email: 'jonh.doe@example.com',
      firstName: 'Jonh',
      lastName: 'Doe',
      userId: 'abc098',
      createdAt,
      image: null,
      fullName: 'Jonh Doe',
      updatedAt,
    };

    const key = `${keyController}/${dataResponse.email}/${dataResponse.id}`;

    dbMock.editPersonUser.mockResolvedValue(dataResponse);

    const result = await personUSerService.editPersonUser({
      personId: dataRequest.id,
      personData: dataRequest,
    });

    expect(dbMock.editPersonUser).toHaveBeenCalled();
    expect(dbMock.editPersonUser).toHaveBeenCalledWith({
      personId: dataRequest.id,
      personData: dataRequest,
    });
    expect(cacheMock.save).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalledWith(key, dataResponse, 1200);
    expect(result).toEqual(dataResponse);
  });

  it('should be call deletePersonUser and to call the deletePersonUser from db provider, and delete all related search keys', async () => {
    const data = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
    };

    const input = { id: data.id };

    const key = `${keyController}/*/${data.id}`;
    const keyFromScan = `${keyController}/jonh.doe@example.com/${data.id}`;

    cacheMock.recover.mockResolvedValue(null);
    cacheMock.scan.mockResolvedValueOnce({
      cursor: 0,
      keys: [keyFromScan],
    });

    dbMock.deletePersonUser.mockResolvedValue();

    await personUSerService.deletePersonUser(input);

    expect(dbMock.deletePersonUser).toHaveBeenCalled();
    expect(cacheMock.scan).toHaveBeenCalled();
    expect(cacheMock.scan).toHaveBeenCalledWith(0, key);
    expect(cacheMock.delete).toHaveBeenCalled();
    expect(cacheMock.delete).toHaveBeenCalledWith([keyFromScan]);
  });
});
