import { AuthProviderGateway } from '@/features/auth/domain/ports/auth-provider.gateway';
import { PersonGateway } from '@/features/auth/domain/ports/person.gateway';

interface RegisterAccountInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterAccountOutput {
  email: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  id: string;
  createdAt: string;
  updatedAt: null;
  accessToken: string;
  refreshToken: string;
  expirationTime: string;
}

export class RegisterAccountUseCase {
  private constructor(
    private readonly authProvider: AuthProviderGateway,
    private readonly personGateway: PersonGateway,
  ) {}

  public static create(
    authProvider: AuthProviderGateway,
    personGateway: PersonGateway,
  ): RegisterAccountUseCase {
    return new RegisterAccountUseCase(authProvider, personGateway);
  }

  public async execute(
    input: RegisterAccountInput,
  ): Promise<RegisterAccountOutput> {
    const account = await this.authProvider.createAccount({
      email: input.email,
      password: input.password,
    });

    let person;
    try {
      person = await this.personGateway.create({
        userId: account.userId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
      });
    } catch (error) {
      // Compensação: sem person não pode sobrar conta órfã no provider.
      await this.authProvider.deleteAccount(account.userId);
      throw error;
    }

    // Falha daqui em diante NÃO desfaz nada: conta+person íntegros, usuário loga via UC-02.
    const session = await this.authProvider.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    return {
      email: session.email,
      userId: account.userId,
      firstName: person.firstName,
      lastName: person.lastName,
      fullName: `${person.firstName} ${person.lastName}`,
      id: person.id,
      createdAt: person.createdAt,
      updatedAt: null,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expirationTime: session.expirationTime,
    };
  }
}
