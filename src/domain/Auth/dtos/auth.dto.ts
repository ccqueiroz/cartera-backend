export type AuthEntitieDTO = {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expirationTime: string;
  lastLoginAt: string;
};

export type AuthSignDTO = {
  password: string;
} & Pick<AuthEntitieDTO, 'email'>;

export type OutputDTO = {
  success: boolean;
  error?: unknown;
};
