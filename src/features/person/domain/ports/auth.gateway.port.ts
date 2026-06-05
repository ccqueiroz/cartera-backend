export interface AuthGateway {
  disableAccount(userId: string): Promise<void>;
  revokeRefreshTokens(userId: string): Promise<void>;
}
