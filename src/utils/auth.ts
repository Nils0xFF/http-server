import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError } from '../types/errors.js';
import { Request } from 'express';

type payload = Pick<JwtPayload, 'iss' | 'sub' | 'iat' | 'exp'>;

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
  const iat = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iss: 'chirpy',
      sub: userID,
      iat,
      exp: iat + expiresIn,
    } satisfies payload,
    secret,
  );
}

export function validateJWT(tokenString: string, secret: string) {
  try {
    const decoded = jwt.verify(tokenString, secret) as payload;
    if (typeof decoded.sub !== 'string') {
      throw new Error();
    }
    return decoded.sub;
  } catch (error) {
    throw new UnauthorizedError('Invalid Token');
  }
}

export function getBearerToken(req: Request): string {
  const token = req.headers.authorization?.replace('Bearer', '').trim();
  if (!token || token.length == 0) {
    throw new UnauthorizedError('No Token provided');
  }

  return token;
}
