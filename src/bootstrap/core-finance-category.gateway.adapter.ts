import {
  CategoryGateway,
  ResolvedCategory,
} from '@/features/core-finance/transaction-engine/domain/ports/category.gateway.port';
import { CategoryRepository } from '@/features/category/domain/ports/category.repository.port';
import { CategoryDescription } from '@/features/category/domain/enums/category-description.enum';

/**
 * Mora no bootstrap: o motor (core-finance) e category não se importam — só o
 * composition root conhece os dois. Resolve a categoria ativa pelo enum para o
 * motor denormalizar `descriptionEnum`/`group` no nó.
 */
export class CoreFinanceCategoryGatewayAdapter implements CategoryGateway {
  private constructor(private readonly repository: CategoryRepository) {}

  public static create(
    repository: CategoryRepository,
  ): CoreFinanceCategoryGatewayAdapter {
    return new CoreFinanceCategoryGatewayAdapter(repository);
  }

  public async resolve(
    descriptionEnum: string,
  ): Promise<ResolvedCategory | null> {
    const category = await this.repository.findActiveByEnum(
      descriptionEnum as CategoryDescription,
    );
    if (!category) return null;
    const output = category.toOutput();
    return { descriptionEnum: output.descriptionEnum, group: output.group };
  }
}
