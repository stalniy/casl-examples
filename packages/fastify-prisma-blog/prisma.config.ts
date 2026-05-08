import { defineConfig } from 'prisma/config';
import { config } from './src/config';

export default defineConfig({
  schema: './schema.prisma',
  datasource: {
    url: config.DATABASE_URL,
  },
});
