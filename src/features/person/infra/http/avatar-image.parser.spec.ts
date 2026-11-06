import { parseAvatarImage } from './avatar-image.parser';
import {
  BusinessRuleViolationError,
  PayloadTooLargeError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const jpegBuffer = (size = 100) => {
  const buffer = Buffer.alloc(size);
  buffer[0] = 0xff;
  buffer[1] = 0xd8;
  buffer[2] = 0xff;
  return buffer;
};

const captureError = (fn: () => unknown): any => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('esperava que lançasse');
};

const pngBuffer = (size = 100) => {
  const buffer = Buffer.alloc(size);
  buffer[0] = 0x89;
  buffer[1] = 0x50;
  buffer[2] = 0x4e;
  buffer[3] = 0x47;
  return buffer;
};

describe('parseAvatarImage', () => {
  it('accepts JPEG by its magic bytes', () => {
    const { buffer, contentType } = parseAvatarImage(
      jpegBuffer().toString('base64'),
    );
    expect(contentType).toBe('image/jpeg');
    expect(buffer.length).toBe(100);
  });

  it('accepts PNG by its magic bytes', () => {
    const { contentType } = parseAvatarImage(pngBuffer().toString('base64'));
    expect(contentType).toBe('image/png');
  });

  it('accepts a data URL and ignores the type declared by the client', () => {
    const dataUrl = `data:image/gif;base64,${pngBuffer().toString('base64')}`;
    expect(parseAvatarImage(dataUrl).contentType).toBe('image/png');
  });

  it('rejects content that is not JPEG or PNG with AVATAR_UNSUPPORTED_TYPE', () => {
    const gif = Buffer.from('GIF89a-not-an-image');
    const error = captureError(() => parseAvatarImage(gif.toString('base64')));
    expect(error).toBeInstanceOf(BusinessRuleViolationError);
    expect(error.code).toBe(ErrorCode.AVATAR_UNSUPPORTED_TYPE);
  });

  it('rejects a decoded image above 5MB with AVATAR_TOO_LARGE (413)', () => {
    const oversized = jpegBuffer(5 * 1024 * 1024 + 1);
    const error = captureError(() =>
      parseAvatarImage(oversized.toString('base64')),
    );
    expect(error).toBeInstanceOf(PayloadTooLargeError);
    expect(error.code).toBe(ErrorCode.AVATAR_TOO_LARGE);
  });

  it('accepts an image exactly at the 5MB limit', () => {
    const atLimit = jpegBuffer(5 * 1024 * 1024);
    expect(parseAvatarImage(atLimit.toString('base64')).contentType).toBe(
      'image/jpeg',
    );
  });
});
