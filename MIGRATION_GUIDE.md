# Migration Guide: MongoDB to PostgreSQL (Neon)

This guide will help you migrate from MongoDB to PostgreSQL using Neon.

## Step 1: Install Dependencies

Run the following command to install the new PostgreSQL dependencies:

```bash
npm install
```

This will install:
- `@neondatabase/serverless` - Neon's serverless PostgreSQL driver
- `drizzle-orm` - Type-safe SQL ORM
- `nanoid` - For generating unique IDs

## Step 2: Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up or log in
3. Create a new project
4. Copy your connection string (it will look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)

## Step 3: Update Environment Variables

Update your `.env` file:

**Remove:**
```env
MONGODB_URI=
```

**Add:**
```env
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

## Step 4: Run Database Migration

Create the watchlist table in your PostgreSQL database:

```bash
npm run migrate
```

This will create:
- `watchlist` table with proper schema
- Unique index on `(user_id, symbol)` to prevent duplicates
- Index on `user_id` for faster queries

**Note:** Better-auth will automatically create its own tables (user, session, etc.) when you first use authentication.

## Step 5: Test the Connection

Test your database connection:

```bash
npm run test:db
```

You should see:
```
OK: Connected to PostgreSQL [db="your-db-name", user="your-user", time=XXXms]
```

## Step 6: Check Environment Variables

Verify all required environment variables are set:

```bash
npm run check:env
```

## Step 7: Restart Your Dev Server

Restart your Next.js development server:

```bash
npm run dev
```

## What Changed

### Database Connection
- **Before:** `database/mongoose.ts` using MongoDB
- **After:** `database/postgres.ts` using Neon PostgreSQL

### Authentication
- **Before:** `mongodbAdapter` from better-auth
- **After:** `postgresAdapter` from better-auth

### Models
- **Before:** Mongoose schemas in `database/models/`
- **After:** Drizzle ORM schemas in `database/schema.ts`

### Actions
- **Before:** MongoDB queries using Mongoose
- **After:** SQL queries using Drizzle ORM

## Troubleshooting

### Connection Issues
- Ensure your `DATABASE_URL` is correct and includes `?sslmode=require`
- Check that your Neon project is active
- Verify your IP is allowed (Neon allows all IPs by default)

### Migration Errors
- Make sure you've run `npm run migrate` before starting the app
- If tables already exist, the migration script will skip creation (safe to run multiple times)

### Better-Auth Tables
- Better-auth creates its tables automatically on first use
- If you see errors about missing tables, try signing up a new user

## Removing Old MongoDB Dependencies (Optional)

After confirming everything works, you can remove MongoDB packages:

```bash
npm uninstall mongodb mongoose
```

## Need Help?

- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Better-Auth Documentation](https://www.better-auth.com/docs)

