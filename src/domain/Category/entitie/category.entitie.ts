import { CategoryDTO } from '../dtos/category.dto';

export type CategoryProps = CategoryDTO;

export class CategoryEntitie {
  private constructor(private props: CategoryProps) {}

  public static with(props: CategoryProps) {
    return new CategoryEntitie(props);
  }

  public get id() {
    return this.props.id;
  }

  public get description() {
    return this.props.description;
  }

  public get type() {
    return this.props.type;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
}
