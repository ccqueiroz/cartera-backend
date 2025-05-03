import { DeterministicSerializationObjectGateway } from '@/domain/Helpers/gateway/deterministic-serialization-object.gateway';
import { GenerateHashGateway } from '@/domain/Helpers/gateway/generate-hash.gateway';
import { crypto } from '@/packages/clients/cripto';

export class GenerateHashHelper implements GenerateHashGateway {
  private static instance: GenerateHashHelper;

  private constructor(
    private readonly deterministSerialization: DeterministicSerializationObjectGateway['execute'],
  ) {}

  public static create(
    deterministSerialization: DeterministicSerializationObjectGateway['execute'],
  ) {
    if (!GenerateHashHelper.instance) {
      GenerateHashHelper.instance = new GenerateHashHelper(
        deterministSerialization,
      );
    }

    return GenerateHashHelper.instance;
  }

  execute<T>(input: T): string | null {
    const objectSerializated = this.deterministSerialization<T>(input);

    if (!objectSerializated) return null;

    const hash = crypto
      .createHash('sha256')
      .update(objectSerializated)
      .digest('hex');

    return hash;
  }
}
