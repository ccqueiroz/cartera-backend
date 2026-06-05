export interface CreatedAuthAccount {
  userId: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  /** Instante absoluto ISO-8601 — nunca duração em segundos/ms. */
  expirationTime: string;
}

export interface RefreshedAuthSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expirationTime: string;
}

export interface VerifiedAccessToken {
  userId: string;
  email: string;
}

export interface AuthProviderGateway {
  createAccount(input: {
    email: string;
    password: string;
  }): Promise<CreatedAuthAccount>;
  signInWithPassword(input: {
    email: string;
    password: string;
  }): Promise<AuthSession>;
  refreshSession(input: {
    refreshToken: string;
  }): Promise<RefreshedAuthSession>;
  revokeRefreshTokens(userId: string): Promise<void>;
  deleteAccount(userId: string): Promise<void>;
  sendPasswordResetEmail(email: string): Promise<void>;
  verifyAccessToken(accessToken: string): Promise<VerifiedAccessToken>;
}
