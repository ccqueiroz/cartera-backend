import { PersonUserEntitieDTO } from '../dtos/person-user.dto';

export type PersonUserEntitieProps = PersonUserEntitieDTO;

export class PersonUserEntitie {
  private constructor(private props: PersonUserEntitieProps) {}

  public static create(userId: string, name: string, email: string) {
    return new PersonUserEntitie({
      userId,
      name,
      email,
    });
  }

  public static with(props: PersonUserEntitieProps) {
    return new PersonUserEntitie(props);
  }

  public get userId() {
    return this.props.userId;
  }

  public get name() {
    return this.props.name;
  }

  public get email() {
    return this.props.email;
  }

  public get image() {
    return this.props.image;
  }
}
