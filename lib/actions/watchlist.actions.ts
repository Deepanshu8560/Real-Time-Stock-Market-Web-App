'use server';

import { getDb } from '@/database/postgres';
import { watchlist } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { nanoid } from 'nanoid';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const db = await getDb();
    
    // Get user from better-auth
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    
    // If no session or email doesn't match, return empty
    if (!session?.user || session.user.email !== email) {
      return [];
    }

    const userId = session.user.id;
    if (!userId) return [];

    // Query watchlist items for this user
    const items = await db
      .select({ symbol: watchlist.symbol })
      .from(watchlist)
      .where(eq(watchlist.userId, userId));

    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function addToWatchlist(symbol: string, company: string): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const userId = session.user.id;
    if (!userId) {
      return { success: false, error: 'User ID not found' };
    }

    const db = await getDb();
    const id = nanoid();
    const upperSymbol = symbol.toUpperCase().trim();

    // Check if already exists
    const existing = await db
      .select()
      .from(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.symbol, upperSymbol)))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: 'Already in watchlist' };
    }

    // Insert new item
    await db.insert(watchlist).values({
      id,
      userId,
      symbol: upperSymbol,
      company: company.trim(),
      addedAt: new Date(),
    });

    return { success: true };
  } catch (err) {
    console.error('addToWatchlist error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add to watchlist' };
  }
}

export async function removeFromWatchlist(symbol: string): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const userId = session.user.id;
    if (!userId) {
      return { success: false, error: 'User ID not found' };
    }

    const db = await getDb();
    const upperSymbol = symbol.toUpperCase().trim();

    await db
      .delete(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.symbol, upperSymbol)));

    return { success: true };
  } catch (err) {
    console.error('removeFromWatchlist error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove from watchlist' };
  }
}

export async function getWatchlistItems(): Promise<Array<{ symbol: string; company: string; addedAt: Date }>> {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return [];
    }

    const userId = session.user.id;
    if (!userId) {
      return [];
    }

    const db = await getDb();
    const items = await db
      .select({
        symbol: watchlist.symbol,
        company: watchlist.company,
        addedAt: watchlist.addedAt,
      })
      .from(watchlist)
      .where(eq(watchlist.userId, userId))
      .orderBy(watchlist.addedAt);

    return items;
  } catch (err) {
    console.error('getWatchlistItems error:', err);
    return [];
  }
}
