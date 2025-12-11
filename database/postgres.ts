import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const DATABASE_URL = process.env.DATABASE_URL;

declare global {
    var postgresCache: {
        client: ReturnType<typeof neon> | null;
        db: ReturnType<typeof drizzle> | null;
    } | undefined;
}

let cached = global.postgresCache;

if (!cached) {
    cached = global.postgresCache = { client: null, db: null };
}

// Configure Neon for better performance
// Note: fetchConnectionCache is now always enabled by default

export const connectToDatabase = async () => {
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL must be set within .env file. Please add a valid PostgreSQL connection string (from Neon or other provider).');
    }

    // Check if DATABASE_URL is empty or just whitespace
    const trimmedUri = DATABASE_URL.trim();
    if (!trimmedUri || trimmedUri.length < 10) {
        throw new Error(`DATABASE_URL appears to be empty or too short. Please check your .env file. Current length: ${DATABASE_URL.length} characters.`);
    }

    // Validate PostgreSQL URI format
    if (!trimmedUri.startsWith('postgres://') && !trimmedUri.startsWith('postgresql://') && !trimmedUri.startsWith('postgresql+neon://')) {
        const preview = trimmedUri.length > 50 ? trimmedUri.substring(0, 50) + '...' : trimmedUri;
        throw new Error(`Invalid DATABASE_URL format. It must start with "postgres://", "postgresql://", or "postgresql+neon://".\nCurrent value (first 50 chars): "${preview}"\n\nPlease check your .env file and ensure DATABASE_URL is set correctly.`);
    }

    // Return cached connection if available
    if (cached.client && cached.db) {
        return { client: cached.client, db: cached.db };
    }

    try {
        // Create Neon client
        const client = neon(trimmedUri);

        // Create Drizzle instance
        const db = drizzle(client);

        // Cache the connections
        cached.client = client;
        cached.db = db;

        // Test the connection
        await client`SELECT 1`;

        console.log(`Connected to PostgreSQL database (${process.env.NODE_ENV})`);

        return { client, db };
    } catch (err) {
        cached.client = null;
        cached.db = null;
        const errorMessage = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to connect to PostgreSQL: ${errorMessage}. Please check your DATABASE_URL in the .env file.`);
    }
}

// Export a function to get just the db instance (for Drizzle)
export const getDb = async () => {
    const { db } = await connectToDatabase();
    return db;
}

