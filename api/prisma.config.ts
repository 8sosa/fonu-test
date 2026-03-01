import { defineConfig } from '@prisma/config';
import 'dotenv/config';

// If we are in Docker, use 'db'. If we are on your Mac, use 'localhost'.
const dbHost = process.env.DOCKER_ENV === 'true' ? 'db' : 'localhost';

// Replace 'db' with 'localhost' dynamically if running on Mac
const url = process.env.DATABASE_URL?.replace('@db:', `@${dbHost}:`);

export default defineConfig({
  datasource: {
    url: url,
  },
});