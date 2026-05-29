import { execSync } from 'child_process';
import path from 'path';

export default function setup() {
  const testDbUrl = 'postgresql://salary-manager:salary-manager-secret@localhost:5432/salary_manager_test';
  
  // Run migrations against the test database before any tests execute
  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(import.meta.dirname, '..'),
    env: {
      ...process.env,
      DATABASE_URL: testDbUrl,
    },
    stdio: 'inherit',
  });
}
