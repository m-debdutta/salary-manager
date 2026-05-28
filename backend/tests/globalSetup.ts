import { execSync } from 'child_process';
import path from 'path';

export default function setup() {
  // Run migrations against the test database before any tests execute
  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(import.meta.dirname, '..'),
    env: {
      ...process.env,
      DATABASE_URL: 'file:./prisma/test.db',
    },
    stdio: 'inherit',
  });
}
