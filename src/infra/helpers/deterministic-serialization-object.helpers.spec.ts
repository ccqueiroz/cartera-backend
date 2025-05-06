import { DeterministicSerializationObjectHelper } from './deterministic-serialization-object.helpers';

describe('Deterministic Serialization Object Helper', () => {
  let deterministicSerializationObjectService: DeterministicSerializationObjectHelper;

  beforeEach(() => {
    deterministicSerializationObjectService =
      new DeterministicSerializationObjectHelper();
  });

  it('should be serializate object of the deterministic method', () => {
    const object = {
      page: 0,
      size: 10,
      ordering: { amount: 'ASC' },
    };

    const result = deterministicSerializationObjectService.execute(object);
    expect(result).toEqual('{"ordering":{"amount":"ASC"},"page":0,"size":10}');
  });

  it('should be serializate object of the deterministic method non import an apply order, but this serialize must be same string', () => {
    const object1 = {
      page: 0,
      size: 10,
      ordering: { amount: 'ASC' },
    };

    const object2 = {
      size: 10,
      page: 0,
      ordering: { amount: 'ASC' },
    };

    const result1 = deterministicSerializationObjectService.execute(object1);
    const result2 = deterministicSerializationObjectService.execute(object2);
    expect(result1).toEqual(result2);
  });

  it('should be serialized object of the deterministic method between two objects and this serializations are to be differents.', () => {
    const object1 = {
      page: 1,
      size: 10,
      ordering: { amount: 'ASC' },
    };

    const object2 = {
      size: 10,
      page: 0,
      ordering: { amount: 'ASC' },
    };

    const result1 = deterministicSerializationObjectService.execute(object1);
    const result2 = deterministicSerializationObjectService.execute(object2);
    expect(result1).not.toEqual(result2);
  });

  it('should be return undefined if the input param of the execute method to be undefined.', () => {
    const result = deterministicSerializationObjectService.execute(undefined);

    expect(result).toEqual(undefined);
  });
});
