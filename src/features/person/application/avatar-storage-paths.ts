const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

/**
 * Path determinístico por usuário: trocar avatar com mesma extensão é
 * overwrite natural; só a extensão antiga vira candidata a delete (D6).
 */
export const avatarStoragePaths = {
  forUpload(userId: string, contentType: string): string {
    return `avatars/${userId}.${EXTENSION_BY_CONTENT_TYPE[contentType]}`;
  },
  allCandidates(userId: string): string[] {
    return Object.values(EXTENSION_BY_CONTENT_TYPE).map(
      (extension) => `avatars/${userId}.${extension}`,
    );
  },
};
