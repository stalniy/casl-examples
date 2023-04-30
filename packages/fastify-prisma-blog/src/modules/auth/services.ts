import jwt from "jsonwebtoken";

/**
 * Bad practice of storing plain text passwords in DB!!!
 * DON'T DO THIS
 */
export function isValidUserPassword(user: { password: string }, password: string): boolean {
  return user.password === password;
}

let ANONYMOUS_TOKEN: string | undefined;
export async function generateToken(config: TokenConfig, user?: { id: string }): Promise<string> {
  if (!user) {
    ANONYMOUS_TOKEN ??= jwt.sign({ anonymous: true }, config.AUTH_SECRET, {
      issuer: config.AUTH_ISSUER,
      audience: config.AUTH_AUDIENCE,
    });
    return ANONYMOUS_TOKEN;
  }

  return jwt.sign({ id: user.id }, config.AUTH_SECRET, {
    issuer: config.AUTH_ISSUER,
    audience: config.AUTH_AUDIENCE,
  });
}

export interface RegisteredUserTokenPayload {
  id: string;
}

export interface AnonymousUserTokenPayload {
  anonymous: true;
}

export async function verifyToken(config: TokenConfig, token: string): Promise<RegisteredUserTokenPayload | AnonymousUserTokenPayload> {
  const payload = jwt.verify(token, config.AUTH_SECRET, {
    issuer: config.AUTH_ISSUER,
    audience: config.AUTH_AUDIENCE,
  });

  return payload as RegisteredUserTokenPayload | AnonymousUserTokenPayload;
}

export interface TokenConfig {
  AUTH_SECRET: string;
  AUTH_ISSUER?: string;
  AUTH_AUDIENCE?: string;
}
