import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

const watchlist = pgTable(
  'watchlist',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id').notNull(),
    symbol: text('symbol').notNull(),
    company: text('company').notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdSymbolIdx: uniqueIndex('user_id_symbol_idx').on(table.userId, table.symbol),
    userIdIdx: uniqueIndex('user_id_idx').on(table.userId),
  })
);

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error('ERROR: DATABASE_URL must be set in .env');
    process.exit(1);
  }

  try {
    console.log('🔄 Creating database schema...\n');
    
    const sql = neon(uri);
    const db = drizzle(sql);

    // Create watchlist table
    await sql`
      CREATE TABLE IF NOT EXISTS watchlist (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        company TEXT NOT NULL,
        added_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create unique index for user_id + symbol combination
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS user_id_symbol_idx ON watchlist(user_id, symbol);
    `;

    // Create index for user_id (non-unique for faster lookups)
    await sql`
      CREATE INDEX IF NOT EXISTS user_id_idx ON watchlist(user_id);
    `;

    console.log('✅ Watchlist table created successfully!');
    console.log('✅ Indexes created successfully!');
    console.log('\n📝 Note: Better-auth will create its own tables automatically when you first use authentication.\n');
    
    process.exit(0);
  } catch (err) {
    console.error('ERROR: Schema migration failed');
    console.error(err);
    process.exit(1);
  }
}

main();

