import { prisma, disconnectDatabase } from '../db/client.js';

/**
 * Initialize database connection and verify it's working
 */
export async function initializeDatabase() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Run a simple query to verify schema
    const count = await prisma.employee.count();
    console.log(`📊 Current employee count: ${count}`);

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Clear all data from the database (useful for testing/development)
 */
export async function clearDatabase() {
  try {
    await prisma.employee.deleteMany();
    console.log('🗑️  Database cleared');
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization complete');
      return disconnectDatabase();
    })
    .catch((error) => {
      console.error('Initialization error:', error);
      process.exit(1);
    });
}
