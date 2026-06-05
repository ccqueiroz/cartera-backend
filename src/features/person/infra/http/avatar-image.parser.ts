import {
  BusinessRuleViolationError,
  PayloadTooLargeError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const MAX_DECODED_BYTES = 5 * 1024 * 1024;
const DATA_URL_PREFIX = /^data:[^;]+;base64,/;

const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

function contentTypeFromMagicBytes(buffer: Buffer): string | null {
  if (buffer.subarray(0, JPEG_MAGIC.length).equals(JPEG_MAGIC))
    return 'image/jpeg';
  if (buffer.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC))
    return 'image/png';
  return null;
}

/**
 * Valida pelo conteúdo decodificado (magic bytes), nunca pelo type declarado
 * pelo cliente; tamanho usa o buffer decodificado (base64 infla ~33%).
 */
export function parseAvatarImage(base64Image: string): {
  buffer: Buffer;
  contentType: string;
} {
  const rawBase64 = base64Image.replace(DATA_URL_PREFIX, '');
  const buffer = Buffer.from(rawBase64, 'base64');

  const contentType = contentTypeFromMagicBytes(buffer);
  if (!contentType)
    throw new BusinessRuleViolationError(ErrorCode.AVATAR_UNSUPPORTED_TYPE);

  if (buffer.length > MAX_DECODED_BYTES)
    throw new PayloadTooLargeError(ErrorCode.AVATAR_TOO_LARGE);

  return { buffer, contentType };
}
