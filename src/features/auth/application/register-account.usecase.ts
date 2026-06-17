import { AuthProviderGateway } from '@/features/auth/domain/ports/auth-provider.gateway';
import { PersonGateway } from '@/features/auth/domain/ports/person.gateway';
import { WalletProvisionGateway } from '@/features/auth/domain/ports/wallet-provision.gateway';
import { LoggerGateway } from '@/shared/logger/logger.gateway';

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
    private readonly walletProvisionGateway?: WalletProvisionGateway,
    private readonly logger?: LoggerGateway,
  ) {}

  public static create(
    authProvider: AuthProviderGateway,
    personGateway: PersonGateway,
    walletProvisionGateway?: WalletProvisionGateway,
    logger?: LoggerGateway,
  ): RegisterAccountUseCase {
    return new RegisterAccountUseCase(
      authProvider,
      personGateway,
      walletProvisionGateway,
      logger,
    );
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

    // Seed da wallet "Cartera" (UC8/W5): aditivo e FORA da compensação — falha é tolerada.
    if (this.walletProvisionGateway) {
      try {
        await this.walletProvisionGateway.provision({
          userId: account.userId,
        });
      } catch (error) {
        this.logger?.error(
          `Falha ao semear a wallet do usuário ${account.userId}: ${String(
            error,
          )}`,
        );
      }
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
