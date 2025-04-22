import {
  LoginValidation,
  RecoveryPasswordValidation,
  RegisterValidation,
  SignoutValidation,
  UserIdAuthValidation,
} from './auth.schema';
import { runValidate } from '@/packages/clients/class-validator';

describe('Auth Schema', () => {
  it('should be validate the attributes of the LoginValidation withou errors', async () => {
    return runValidate<LoginValidation>(LoginValidation, {
      email: 'jonh.doe@gmail.com',
      password: '123456',
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the LoginValidation with email error must be defined', async () => {
    return runValidate<LoginValidation>(LoginValidation, {
      email: undefined as any,
      password: '123456',
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isDefined: 'email should not be null or undefined',
        maxLength: 'email must be shorter than or equal to 50 characters',
        isEmail: 'email must be an email',
      });
    });
  });

  it('should be validate the attributes of the LoginValidation with email error must be an email', async () => {
    return runValidate<LoginValidation>(LoginValidation, {
      email: 'jonh.doe',
      password: '123456',
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isEmail: 'email must be an email',
      });
    });
  });

  it('should be validate the attributes of the LoginValidation with email error must have up to 50 chars', async () => {
    let email = '';

    for (let i = 0; i < 50; i++) {
      email += 'a';
    }

    email += '@gmail.com';

    return runValidate<LoginValidation>(LoginValidation, {
      email,
      password: '123456',
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        maxLength: 'email must be shorter than or equal to 50 characters',
      });
    });
  });

  it('should be validate the attributes of the LoginValidation with password error error must be defined', async () => {
    return runValidate<LoginValidation>(LoginValidation, {
      email: 'jonh.doe@gmail.com',
      password: undefined as any,
    }).then((errors) => {
      expect(errors.length).toEqual(1);
      expect(errors[0].constraints).toEqual({
        isDefined: 'password should not be null or undefined',
        maxLength: 'password must be shorter than or equal to 30 characters',
        minLength: 'password must be longer than or equal to 5 characters',
        isString: 'password must be a string',
      });
    });
  });

  it('should be validate the attributes of the RecoveryPasswordValidation withou errors', async () => {
    return runValidate<RecoveryPasswordValidation>(RecoveryPasswordValidation, {
      email: 'jonh.doe@gmail.com',
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the RegisterValidation withou errors', async () => {
    return runValidate<RegisterValidation>(RegisterValidation, {
      email: 'jonh.doe@gmail.com',
      password: '1234567',
      confirmPassword: '1234567',
      firstName: 'Jonh',
      lastName: 'Doe',
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the SignoutValidation withou errors', async () => {
    return runValidate<SignoutValidation>(SignoutValidation, {
      userId: '1991',
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });

  it('should be validate the attributes of the UserIdAuthValidation withou errors', async () => {
    return runValidate<UserIdAuthValidation>(UserIdAuthValidation, {
      authUserId: '1991',
    }).then((errors) => {
      expect(errors.length).toEqual(0);
    });
  });
});
