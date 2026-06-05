import { Person, PersonPersistence } from './person.entity';
import {
  BusinessRuleViolationError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const VALID_CPF = '39053344705';

const makePerson = () =>
  Person.create({
    id: 'person-1',
    userId: 'user-1',
    email: 'caio@example.com',
    firstName: 'Caio',
    lastName: 'Queiroz',
    createdAt: '2026-06-04T12:00:00.000Z',
  });

const basePersistence = (): PersonPersistence => ({
  id: 'person-1',
  userId: 'user-1',
  email: 'caio@example.com',
  firstName: 'Caio',
  lastName: 'Queiroz',
  phone: null,
  document: { type: 'CPF', value: VALID_CPF },
  avatarUrl: 'https://bucket/avatars/user-1',
  birthDate: '1990-01-15',
  occupation: 'Dev',
  monthlyIncome: { value: 10000, currency: 'BRL' },
  defaultCurrency: 'BRL',
  createdAt: '2026-06-04T12:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
});

describe('Person', () => {
  it('create nasce ativo, sem avatar/document/phone e sem updatedAt', () => {
    const person = makePerson();
    const output = person.toOutput();
    expect(output.isActive).toBe(true);
    expect(output.deletedAt).toBeNull();
    expect(output.updatedAt).toBeNull();
    expect(output.avatarUrl).toBeNull();
    expect(output.document).toBeNull();
    expect(output.phone).toBeNull();
    expect(output.monthlyIncome).toEqual({ value: null, currency: null });
  });

  it('toPersistence não contém fullName nem isActive', () => {
    const persisted = makePerson().toPersistence() as unknown as Record<
      string,
      unknown
    >;
    expect(persisted).not.toHaveProperty('fullName');
    expect(persisted).not.toHaveProperty('isActive');
  });

  it('toOutput computa fullName e isActive', () => {
    const person = Person.with({ ...basePersistence(), deletedAt: null });
    expect(person.toOutput().fullName).toBe('Caio Queiroz');
    expect(person.toOutput().isActive).toBe(true);

    const deleted = Person.with({
      ...basePersistence(),
      deletedAt: '2026-06-04T13:00:00.000Z',
    });
    expect(deleted.toOutput().isActive).toBe(false);
  });

  it('document persiste puro e sai mascarado', () => {
    const person = Person.with(basePersistence());
    expect(person.toPersistence().document).toEqual({
      type: 'CPF',
      value: VALID_CPF,
    });
    expect(person.toOutput().document).toEqual({
      type: 'CPF',
      value: '390.xxx.xxx-05',
    });
  });

  it('update aplica campos editáveis e seta updatedAt', () => {
    const person = makePerson();
    person.update(
      {
        firstName: 'Cezar',
        occupation: 'Engenheiro',
        document: { type: 'CPF', value: '390.533.447-05' },
        phone: { number: '11987654321', countryCode: '+55', isWhatsapp: true },
        birthDate: '1991-02-20',
        monthlyIncome: { value: 12000, currency: 'BRL' },
        defaultCurrency: 'BRL',
      },
      '2026-06-04T14:00:00.000Z',
    );
    const output = person.toOutput();
    expect(output.firstName).toBe('Cezar');
    expect(output.fullName).toBe('Cezar Queiroz');
    expect(output.occupation).toBe('Engenheiro');
    expect(output.updatedAt).toBe('2026-06-04T14:00:00.000Z');
    expect(person.toPersistence().document?.value).toBe(VALID_CPF);
  });

  it('update com document inválido lança erro de domínio', () => {
    const person = makePerson();
    expect(() =>
      person.update(
        { document: { type: 'CPF', value: '39053344700' } },
        '2026-06-04T14:00:00.000Z',
      ),
    ).toThrow(BusinessRuleViolationError);
  });

  it('update com phone inválido lança INVALID_PHONE', () => {
    const person = makePerson();
    const error = (() => {
      try {
        person.update(
          { phone: { number: '123', countryCode: '+55', isWhatsapp: false } },
          '2026-06-04T14:00:00.000Z',
        );
      } catch (thrown) {
        return thrown as any;
      }
      throw new Error('esperava que lançasse');
    })();
    expect(error.code).toBe(ErrorCode.INVALID_PHONE);
  });

  it('rejeita birthDate fora de YYYY-MM-DD', () => {
    const person = makePerson();
    expect(() =>
      person.update({ birthDate: '15/01/1990' }, '2026-06-04T14:00:00.000Z'),
    ).toThrow(ValidationError);
  });

  it('rejeita firstName vazio', () => {
    const person = makePerson();
    expect(() =>
      person.update({ firstName: '  ' }, '2026-06-04T14:00:00.000Z'),
    ).toThrow(ValidationError);
  });

  it('softDelete é terminal e idempotente', () => {
    const person = makePerson();
    person.softDelete('2026-06-04T15:00:00.000Z');
    expect(person.isActive).toBe(false);
    expect(person.toPersistence().deletedAt).toBe('2026-06-04T15:00:00.000Z');

    person.softDelete('2026-06-05T15:00:00.000Z');
    expect(person.toPersistence().deletedAt).toBe('2026-06-04T15:00:00.000Z');
  });

  it('changeAvatar/removeAvatar mutam avatarUrl e updatedAt', () => {
    const person = makePerson();
    person.changeAvatar(
      'https://bucket/avatars/user-1',
      '2026-06-04T16:00:00.000Z',
    );
    expect(person.avatarUrl).toBe('https://bucket/avatars/user-1');
    person.removeAvatar('2026-06-04T17:00:00.000Z');
    expect(person.avatarUrl).toBeNull();
    expect(person.toPersistence().updatedAt).toBe('2026-06-04T17:00:00.000Z');
  });

  it('syncEmail atualiza espelho e updatedAt', () => {
    const person = makePerson();
    person.syncEmail('novo@example.com', '2026-06-04T18:00:00.000Z');
    expect(person.email).toBe('novo@example.com');
    expect(person.toPersistence().updatedAt).toBe('2026-06-04T18:00:00.000Z');
  });
});
