import { HttpStatus } from './http-status';

describe('HttpStatus', () => {
  it('mapeia nomes do protocolo para os códigos numéricos corretos', () => {
    expect(HttpStatus.OK).toBe(200);
    expect(HttpStatus.BAD_REQUEST).toBe(400);
    expect(HttpStatus.UNAUTHORIZED).toBe(401);
    expect(HttpStatus.FORBIDDEN).toBe(403);
    expect(HttpStatus.NOT_FOUND).toBe(404);
    expect(HttpStatus.CONFLICT).toBe(409);
    expect(HttpStatus.PAYLOAD_TOO_LARGE).toBe(413);
    expect(HttpStatus.UNPROCESSABLE_ENTITY).toBe(422);
    expect(HttpStatus.TOO_MANY_REQUESTS).toBe(429);
    expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
  });
});
