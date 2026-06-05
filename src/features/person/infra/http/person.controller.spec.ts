import type { Request, Response } from 'express';
import { PersonController } from '@/features/person/infra/http/person.controller';
import {
  BusinessRuleViolationError,
  PayloadTooLargeError,
  UnauthorizedError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

function makeResponse() {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res as Response;
}

function makeUseCases() {
  return {
    getOwn: { execute: jest.fn() },
    updateOwn: { execute: jest.fn() },
    deleteOwn: { execute: jest.fn() },
    replaceAvatar: { execute: jest.fn() },
    removeAvatar: { execute: jest.fn() },
  } as any;
}

const authedRequest = (body: unknown = {}) =>
  ({
    body,
    user_auth: { userId: 'user-1', email: 'caio@example.com' },
  } as unknown as Request);

const jpegBase64 = () => {
  const buffer = Buffer.alloc(64);
  buffer[0] = 0xff;
  buffer[1] = 0xd8;
  buffer[2] = 0xff;
  return buffer.toString('base64');
};

describe('PersonController', () => {
  it('getOwn responde 200 com o output do person', async () => {
    const useCases = makeUseCases();
    const output = { id: 'person-1', fullName: 'Caio Queiroz' };
    useCases.getOwn.execute.mockResolvedValue({ toOutput: () => output });
    const res = makeResponse();

    await PersonController.create(useCases).getOwn(authedRequest(), res);

    expect(useCases.getOwn.execute).toHaveBeenCalledWith({
      userId: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(output);
  });

  it('rejeita request sem user_auth com UnauthorizedError (401)', async () => {
    const useCases = makeUseCases();
    const res = makeResponse();

    await expect(
      PersonController.create(useCases).getOwn({ body: {} } as Request, res),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(useCases.getOwn.execute).not.toHaveBeenCalled();
  });

  it('updateOwn valida o schema e repassa só os campos editáveis', async () => {
    const useCases = makeUseCases();
    const output = { id: 'person-1' };
    useCases.updateOwn.execute.mockResolvedValue({ toOutput: () => output });
    const res = makeResponse();

    await PersonController.create(useCases).updateOwn(
      authedRequest({
        firstName: 'Cezar',
        email: 'hack@example.com',
        avatarUrl: 'http://x',
      }),
      res,
    );

    const input = useCases.updateOwn.execute.mock.calls[0][0];
    expect(input.userId).toBe('user-1');
    expect(input.firstName).toBe('Cezar');
    expect(input).not.toHaveProperty('email');
    expect(input).not.toHaveProperty('avatarUrl');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateOwn rejeita payload inválido com ValidationError (400)', async () => {
    const useCases = makeUseCases();
    const res = makeResponse();

    await expect(
      PersonController.create(useCases).updateOwn(
        authedRequest({ birthDate: '15/01/1990' }),
        res,
      ),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(useCases.updateOwn.execute).not.toHaveBeenCalled();
  });

  it('deleteOwn responde 204', async () => {
    const useCases = makeUseCases();
    useCases.deleteOwn.execute.mockResolvedValue(undefined);
    const res = makeResponse();

    await PersonController.create(useCases).deleteOwn(authedRequest(), res);

    expect(useCases.deleteOwn.execute).toHaveBeenCalledWith({
      userId: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('replaceAvatar decodifica base64 e repassa buffer + contentType', async () => {
    const useCases = makeUseCases();
    const output = { id: 'person-1', avatarUrl: 'http://bucket/a.jpg' };
    useCases.replaceAvatar.execute.mockResolvedValue({
      toOutput: () => output,
    });
    const res = makeResponse();

    await PersonController.create(useCases).replaceAvatar(
      authedRequest({ image: jpegBase64() }),
      res,
    );

    const input = useCases.replaceAvatar.execute.mock.calls[0][0];
    expect(input.userId).toBe('user-1');
    expect(input.contentType).toBe('image/jpeg');
    expect(Buffer.isBuffer(input.buffer)).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(output);
  });

  it('replaceAvatar rejeita conteúdo não-imagem com 422 (AVATAR_UNSUPPORTED_TYPE)', async () => {
    const useCases = makeUseCases();
    const res = makeResponse();

    const promise = PersonController.create(useCases).replaceAvatar(
      authedRequest({ image: Buffer.from('not-an-image').toString('base64') }),
      res,
    );
    await expect(promise).rejects.toBeInstanceOf(BusinessRuleViolationError);
    await expect(promise).rejects.toMatchObject({
      code: ErrorCode.AVATAR_UNSUPPORTED_TYPE,
    });
    expect(useCases.replaceAvatar.execute).not.toHaveBeenCalled();
  });

  it('replaceAvatar rejeita imagem acima de 5MB com 413 (AVATAR_TOO_LARGE)', async () => {
    const useCases = makeUseCases();
    const res = makeResponse();
    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1);
    oversized[0] = 0xff;
    oversized[1] = 0xd8;
    oversized[2] = 0xff;

    const promise = PersonController.create(useCases).replaceAvatar(
      authedRequest({ image: oversized.toString('base64') }),
      res,
    );
    await expect(promise).rejects.toBeInstanceOf(PayloadTooLargeError);
    await expect(promise).rejects.toMatchObject({
      code: ErrorCode.AVATAR_TOO_LARGE,
    });
  });

  it('replaceAvatar rejeita body sem image com ValidationError', async () => {
    const useCases = makeUseCases();
    const res = makeResponse();

    await expect(
      PersonController.create(useCases).replaceAvatar(authedRequest({}), res),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('removeAvatar responde 204', async () => {
    const useCases = makeUseCases();
    useCases.removeAvatar.execute.mockResolvedValue(undefined);
    const res = makeResponse();

    await PersonController.create(useCases).removeAvatar(authedRequest(), res);

    expect(useCases.removeAvatar.execute).toHaveBeenCalledWith({
      userId: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
