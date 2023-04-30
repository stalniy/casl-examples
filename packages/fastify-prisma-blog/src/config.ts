import { loadConfig } from "jotenv";
import type { FromSchema } from "json-schema-to-ts";

const schema = {
  type: "object",
  required: ["DATABASE_URL", "SERVER_PORT", "AUTH_SECRET"],
  properties: {
    SERVER_PORT: {
      type: "integer",
      default: 3000
    },
    DATABASE_URL: {
      type: "string"
    },
    AUTH_SECRET: {
      type: "string"
    },
    AUTH_ISSUER: {
      type: "string",
      default: "CASL.Prisma.Fastify",
    },
    AUTH_AUDIENCE: {
      type: "string",
      default: "casl.io"
    }
  }
} as const;

export type AppConfig = FromSchema<typeof schema>;
export const config = loadConfig<AppConfig>({
  path: `${process.cwd()}/.env`,
  schema,
});
