import { ReplaceAvatarSchema } from './replace-avatar.schema';
import {
  runValidate,
  ValidatorOptions,
} from '@/packages/clients/class-validator';

const DROP_UNKNOWN: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: false,
};

describe('ReplaceAvatarSchema', () => {
  it('accepts a base64 image when present', async () => {
    const errors = await runValidate(
      ReplaceAvatarSchema,
      { image: Buffer.from('img').toString('base64') },
      DROP_UNKNOWN,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejects a body without image', async () => {
    const errors = await runValidate(ReplaceAvatarSchema, {}, DROP_UNKNOWN);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an empty image', async () => {
    const errors = await runValidate(
      ReplaceAvatarSchema,
      { image: '' },
      DROP_UNKNOWN,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
