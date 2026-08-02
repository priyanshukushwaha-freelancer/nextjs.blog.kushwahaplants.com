import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Attempting connection to terminate other backends...');
  
  // Terminate all other connections to the database to free up PgBouncer slots
  const result = await prisma.$executeRawUnsafe(`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE pid <> pg_backend_pid()
    AND datname = 'postgres';
  `);
  
  console.log('Successfully terminated other connections. Results:', result);
}

main()
  .catch((err) => {
    console.error('Failed to run termination:', err.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
