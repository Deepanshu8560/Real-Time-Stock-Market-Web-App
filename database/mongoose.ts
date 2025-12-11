import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
}

let cached = global.mongooseCache;

if(!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
    if(!MONGODB_URI) {
        throw new Error('MONGODB_URI must be set within .env file. Please add a valid MongoDB connection string.');
    }

    // Check if MONGODB_URI is empty or just whitespace
    const trimmedUri = MONGODB_URI.trim();
    if(!trimmedUri || trimmedUri.length < 10) {
        throw new Error(`MONGODB_URI appears to be empty or too short. Please check your .env file. Current length: ${MONGODB_URI.length} characters.`);
    }

    // Validate MongoDB URI format
    if(!trimmedUri.startsWith('mongodb://') && !trimmedUri.startsWith('mongodb+srv://')) {
        // Show first 50 chars for debugging (but mask sensitive parts)
        const preview = trimmedUri.length > 50 ? trimmedUri.substring(0, 50) + '...' : trimmedUri;
        throw new Error(`Invalid MONGODB_URI format. It must start with "mongodb://" or "mongodb+srv://".\nCurrent value (first 50 chars): "${preview}"\n\nPlease check your .env file and ensure MONGODB_URI is set correctly.`);
    }

    if(cached.conn) return cached.conn;

    if(!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, { 
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        const errorMessage = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to connect to MongoDB: ${errorMessage}. Please check your MONGODB_URI in the .env file.`);
    }

    console.log(`Connected to database ${process.env.NODE_ENV}`);

    return cached.conn;
}
