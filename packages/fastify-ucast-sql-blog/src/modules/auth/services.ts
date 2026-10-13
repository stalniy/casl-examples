import jwt from 'jsonwebtoken';
import type { AppConfig } from '../../config.js';

type TokenPayload = { id?: string; anonymous?: boolean };

export function generateToken(config: AppConfig, user?: { id: string }): string {
  return jwt.sign(user ? { id: user.id } : { anonymous: true }, config.AUTH_SECRET, {
    issuer: config.AUTH_ISSUER,
    audience: config.AUTH_AUDIENCE,
  });
}

export function verifyToken(config: AppConfig, token: string): TokenPayload {
  return jwt.verify(token, config.AUTH_SECRET, {
    issuer: config.AUTH_ISSUER,
    audience: config.AUTH_AUDIENCE,
  }) as TokenPayload;
}

// Plain-text passwords are only used for this example's fixtures.
export function isValidUserPassword(user: { password: string }, password: string): boolean {
  return user.password === password;
}
