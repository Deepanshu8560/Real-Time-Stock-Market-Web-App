import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { connectToDatabase } from "@/database/postgres";
import { nextCookies } from "better-auth/next-js";

let authInstance: ReturnType<typeof betterAuth> | null = null;
let authPromise: Promise<ReturnType<typeof betterAuth>> | null = null;

export const getAuth = async () => {
    if (authInstance) return authInstance;

    if (!authPromise) {
        authPromise = (async () => {
            const { db } = await connectToDatabase();

            if (!db) throw new Error('PostgreSQL connection not found');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            authInstance = betterAuth({
                database: drizzleAdapter(db as any, {
                    provider: 'pg', // PostgreSQL provider
                }),
                secret: process.env.BETTER_AUTH_SECRET,
                baseURL: process.env.BETTER_AUTH_URL,
                emailAndPassword: {
                    enabled: true,
                    disableSignUp: false,
                    requireEmailVerification: false,
                    minPasswordLength: 8,
                    maxPasswordLength: 128,
                    autoSignIn: true,
                },
                plugins: [nextCookies()],
            });

            return authInstance;
        })();
    }

    return await authPromise;
}
