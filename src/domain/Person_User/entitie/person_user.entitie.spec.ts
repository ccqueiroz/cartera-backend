import { PersonUserEntitie } from './person_user.entitie';

describe('Person User Entitie', () => {
  it('should be return Person User instance with mandatory attributes when call static method with of the PersonUser class', () => {
    const personUserObject = {
      userId: '123456780912',
      firstName: 'Jhon',
      lastName: 'Doe',
      fullName: 'Jhon Doe',
      email: 'jhon.doe@gmail.com',
      createdAt: 121212,
      updatedAt: null,
    };

    const personUser = PersonUserEntitie.with(personUserObject);

    expect(personUser.userId).toBe(personUserObject.userId);
    expect(personUser.firstName).toBe(personUserObject.firstName);
    expect(personUser.lastName).toBe(personUserObject.lastName);
    expect(personUser.fullName).toBe(personUserObject.fullName);
    expect(personUser.email).toBe(personUserObject.email);
  });

  it('should be return Person User instance with all attributes when call static method with of the PersonUser class', () => {
    const personUserObject = {
      userId: '123456780912',
      firstName: 'Jhon',
      lastName: 'Doe',
      fullName: 'Jhon Doe',
      email: 'jhon.doe@gmail.com',
      id: '1212121',
      image: 'http://image-teste.com',
      createdAt: 1724708206117,
      updatedAt: 1724708206118,
    };

    const personUser = PersonUserEntitie.with(personUserObject);

    expect(personUser.userId).toBe(personUserObject.userId);
    expect(personUser.firstName).toBe(personUserObject.firstName);
    expect(personUser.lastName).toBe(personUserObject.lastName);
    expect(personUser.fullName).toBe(personUserObject.fullName);
    expect(personUser.email).toBe(personUserObject.email);
    expect(personUser.createdAt).toBe(personUserObject.createdAt);
    expect(personUser.updatedAt).toBe(personUserObject.updatedAt);
    expect(personUser.image).toBe(personUserObject.image);
    expect(personUser.id).toBe(personUserObject.id);
  });

  it('should be return Person User instance with mandatory attributes when call static method create of the PersonUser class', () => {
    const personUserObject = {
      userId: '123456780912',
      firstName: 'Jhon',
      lastName: 'Doe',
      email: 'jhon.doe@gmail.com',
      createdAt: 1724708206117,
      updatedAt: null,
    };

    const personUser = PersonUserEntitie.create(personUserObject);

    expect(personUser.userId).toBe(personUserObject.userId);
    expect(personUser.firstName).toBe(personUserObject.firstName);
    expect(personUser.lastName).toBe(personUserObject.lastName);
    expect(personUser.fullName).toBe(
      `${personUserObject.firstName} ${personUserObject.lastName}`,
    );
    expect(personUser.email).toBe(personUserObject.email);
    expect(personUser.createdAt).toBe(personUserObject.createdAt);
    expect(personUser.image).toBeNull();
    expect(personUser.updatedAt).toBe(personUserObject.createdAt);
  });

  it('should be return full name just with first name when create the instante of Person User and the attribute lastName dont be provider', () => {
    const personUserObject = {
      userId: '123456780912',
      firstName: 'Jhon',
      lastName: '',
      email: 'jhon.doe@gmail.com',
      createdAt: 1724708206117,
      updatedAt: null,
    };

    const personUser = PersonUserEntitie.create(personUserObject);

    expect(personUser.fullName).toBe(`${personUserObject.firstName}`);
  });
});
