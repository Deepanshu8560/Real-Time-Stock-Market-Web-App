import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error('ERROR: DATABASE_URL must be set in .env');
    process.exit(1);
  }

  try {
    const startedAt = Date.now();
    const sql = neon(uri);
    
    // Test the connection
    const result = await sql`SELECT version(), current_database() as db_name, current_user as user_name`;
    const elapsed = Date.now() - startedAt;

    const dbName = result[0]?.db_name || '(unknown)';
    const version = result[0]?.version || '(unknown)';
    const userName = result[0]?.user_name || '(unknown)';

    console.log(`OK: Connected to PostgreSQL [db="${dbName}", user="${userName}", time=${elapsed}ms]`);
    console.log(`   Version: ${version}`);
    process.exit(0);
  } catch (err) {
    console.error('ERROR: Database connection failed');
    console.error(err);
    process.exit(1);
  }
}

main();
