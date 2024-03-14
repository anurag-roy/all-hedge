import { createHash } from 'node:crypto';

export const getHash = (input: string) => createHash('sha256').update(input).digest('hex');
