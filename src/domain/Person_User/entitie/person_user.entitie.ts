import { PersonUserEntitieDTO } from '../dtos/person-user.dto';

export type PersonUserEntitieProps = PersonUserEntitieDTO;

export class PersonUserEntitie {
  private constructor(private props: PersonUserEntitieProps) {}

  public static create({
    userId,
    firstName,
    lastName,
    email,
    createdAt,
  }: Pick<
    PersonUserEntitieDTO,
    'userId' | 'firstName' | 'lastName' | 'email' | 'createdAt'
  >) {
    return new PersonUserEntitie({
      userId,
      firstName,
      lastName,
      email,
      createdAt,
      image: null,
      updatedAt: null,
    });
  }

  public static with(props: PersonUserEntitieProps) {
    return new PersonUserEntitie(props);
  }

  public get id() {
    return this.props.id;
  }

  public get userId() {
    return this.props.userId;
  }

  public get firstName() {
    return this.props.firstName;
  }

  public get lastName() {
    return this.props.lastName;
  }

  public get fullName() {
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  public get email() {
    return this.props.email;
  }

  public get image() {
    return this.props.image;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
}
