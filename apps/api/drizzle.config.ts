import { defineConfig } from 'drizzle-kit';

// Generation is offline. Never use push against the production database.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/libs/db/schema.ts',
  out: '../../drizzle',
});
