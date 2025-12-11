'use server';

import { getDb } from "@/database/postgres";
import { sql } from 'drizzle-orm';

export const getAllUsersForNewsEmail = async () => {
    try {
        const db = await getDb();

        // Query users from better-auth's user table
        // Better-auth uses a 'user' table in PostgreSQL
        const users = await db.execute(sql`
            SELECT id, email, name 
            FROM "user" 
            WHERE email IS NOT NULL AND name IS NOT NULL
        `);

        return users.rows.map((user: any) => ({
            id: user.id || '',
            email: user.email,
            name: user.name
        }));
    } catch (e) {
        console.error('Error fetching users for news email:', e);
        return [];
    }
}
