/**
 * Provisão da wallet default no registro (UC8/W5). O adapter (bootstrap) delega
 * ao use case interno da feature wallet — auth nunca importa wallet direto.
 * Chamada FORA da compensação: falha é tolerada (logada e seguida).
 */
export interface WalletProvisionGateway {
  provision(input: { userId: string }): Promise<void>;
}
