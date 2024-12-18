import { AuthEntitieDTO } from '../dtos/auth.dto';
import { AuthEntitie } from './auth.entitie';

describe('Auth Entitie', () => {
  it('should be return Auth instance with mandatory attributes when call static method with of the AuthEntitie class', () => {
    const authObject = {
      email: 'jonh.doe@gmail.com',
      userId: 'user-id-test',
      expirationTime: 1724708206117,
      accessToken: 'access-token-test',
      refreshToken: 'refresh-token-test',
      lastLoginAt: 1724704559822,
    };
    const auth = AuthEntitie.with(authObject);

    expect(auth.email).toBe(authObject.email);
    expect(auth.userId).toBe(authObject.userId);
    expect(auth.expirationTime).toBe(authObject.expirationTime);
    expect(auth.accessToken).toBe(authObject.accessToken);
    expect(auth.refreshToken).toBe(authObject.refreshToken);
    expect(auth.lastLoginAt).toBe(authObject.lastLoginAt);
  });

  it('should be return Auth instance with all attributes when call static method with of the AuthEntitie class', () => {
    const authObject: AuthEntitieDTO = {
      email: 'jonh.doe@gmail.com',
      userId: 'user-id-test',
      expirationTime: 1724708206117,
      accessToken: 'access-token-test',
      refreshToken: 'refresh-token-test',
      lastLoginAt: 1724704559822,
      firstName: 'Jonh',
      lastName: 'Doe',
      createdAt: 1724708206117,
      updatedAt: 1724708206118,
    };
    const auth = AuthEntitie.with(authObject);

    expect(auth.email).toBe(authObject.email);
    expect(auth.userId).toBe(authObject.userId);
    expect(auth.expirationTime).toBe(authObject.expirationTime);
    expect(auth.accessToken).toBe(authObject.accessToken);
    expect(auth.refreshToken).toBe(authObject.refreshToken);
    expect(auth.lastLoginAt).toBe(authObject.lastLoginAt);
    expect(auth.firstName).toBe(authObject.firstName);
    expect(auth.lastName).toBe(authObject.lastName);
    expect(auth.createdAt).toBe(authObject.createdAt);
    expect(auth.updatedAt).toBe(authObject.updatedAt);
  });
});
