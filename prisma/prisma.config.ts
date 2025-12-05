import { defineConfig } from '@prisma/client';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.TURSO_CONNECTION_URL,
    },
  },
});
