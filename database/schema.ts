import { pgTable, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';

// Watchlist table schema
export const watchlist = pgTable(
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
    userIdIdx: index('user_id_idx').on(table.userId),
  })
);

export type WatchlistItem = typeof watchlist.$inferSelect;
export type NewWatchlistItem = typeof watchlist.$inferInsert;

