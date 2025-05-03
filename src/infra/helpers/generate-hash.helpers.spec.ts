import { DeterministicSerializationObjectGateway } from '@/domain/Helpers/gateway/deterministic-serialization-object.gateway';
import { GenerateHashHelper } from './generate-hash.helpers';
import { crypto } from '@/packages/clients/crypto';

let deterministcSerializationMock: jest.Mocked<DeterministicSerializationObjectGateway>;

describe('Generate Hash Helper', () => {
  let generateHashService: GenerateHashHelper;

  beforeEach(() => {
    jest.clearAllMocks();

    deterministcSerializationMock = {
      execute: jest.fn(),
    };

    generateHashService = GenerateHashHelper.create(
      deterministcSerializationMock.execute,
    );
  });

  afterEach(() => {
    GenerateHashHelper['instance'] = null as any;
  });

  it('should be a verify singleton', () => {
    const instance2 = GenerateHashHelper.create(
      deterministcSerializationMock.execute,
    );

    expect(generateHashService).toEqual(instance2);
  });

  it('should be generate a hash from object', () => {
    const input = { page: 0, size: 10 };
    const objSerializated = '{"page":0,"size":10}';

    deterministcSerializationMock.execute.mockReturnValue(objSerializated);

    const result = generateHashService.execute(input);

    const expectedHash = crypto
      .createHash('sha256')
      .update(objSerializated)
      .digest('hex');

    expect(result).toEqual(expectedHash);
  });

  it('should be generate the same hash to two equals objects in two differents calls', () => {
    const input = { page: 0, size: 10 };
    const objSerializated = '{"page":0,"size":10}';

    deterministcSerializationMock.execute.mockReturnValue(objSerializated);

    const result1 = generateHashService.execute(input);
    const result2 = generateHashService.execute(input);

    expect(result1).toEqual(result2);
  });

  it('should be generate differents hashs to two differents objects in two differents calls', () => {
    const input1 = { page: 0, size: 10 };
    const objSerializated1 = '{"page":0,"size":10}';

    const input2 = { page: 1, size: 10 };
    const objSerializated2 = '{"page":1,"size":10}';

    deterministcSerializationMock.execute.mockReturnValue(objSerializated1);

    const result1 = generateHashService.execute(input1);

    deterministcSerializationMock.execute.mockReturnValue(objSerializated2);
    const result2 = generateHashService.execute(input2);

    expect(result1).not.toEqual(result2);
  });

  it('should be return null when object serializeted to be undefined or dont exist', () => {
    const input = { page: 0, size: 10 };

    deterministcSerializationMock.execute.mockReturnValue(undefined);

    const result = generateHashService.execute(input);

    expect(result).toBeNull();
  });
});
