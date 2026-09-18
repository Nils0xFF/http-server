import { describe, it, expect, beforeAll } from 'vitest';
import { checkPasswordHash, hashPassword, makeJWT, validateJWT } from './auth.js';
import { UnauthorizedError } from '../types/errors.js';

describe('Password Hashing', () => {
  const password1 = 'correctPassword123!';
  const password2 = 'anotherPassword456!';
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it('should return true for the correct password', async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe('JWT Parsing', () => {
  const secret = 'vitestsecret';

  it('should parse valid token', async () => {
    const token = makeJWT('user-123', 200, secret);
    expect(validateJWT(token, secret)).toEqual('user-123');
  });

  it('should reject invalid token', async () => {
    const randomToken = 'dhkjashdjksahdjashdjashdjashdjahda';
    expect(() => validateJWT(randomToken, secret)).toThrow(UnauthorizedError);
  });

  it('should reject valid token with wrong secret', async () => {
    const token = makeJWT('user-123', 200, 'faulty secret');
    expect(() => validateJWT(token, secret)).toThrow(UnauthorizedError);
  });
});
