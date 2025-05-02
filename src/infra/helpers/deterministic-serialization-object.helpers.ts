import { DeterministicSerializationObjectGateway } from '@/domain/Helpers/gateway/deterministic-serialization-object.gateway';
import { stringify } from '@/packages/clients/jsonStableStringify';

export class DeterministicSerializationObjectHelper
  implements DeterministicSerializationObjectGateway
{
  execute<T>(input: T): string | undefined {
    const objectSerializated = stringify(input);

    return objectSerializated;
  }
}
