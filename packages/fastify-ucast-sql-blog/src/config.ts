export interface AppConfig {
  IMPLEMENTATION: string;
  DATABASE_URL: string;
  SERVER_PORT: number;
  AUTH_SECRET: string;
  AUTH_ISSUER?: string;
  AUTH_AUDIENCE?: string;
}
