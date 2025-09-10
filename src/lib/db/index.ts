import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Validate required environment variable
if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL in environment variables. Please check your Supabase integration.")
}

// Create the connection using Supabase PostgreSQL URL
const connectionString = process.env.POSTGRES_URL!

// Disable prefetch as it's not compatible with Supabase
const client = postgres(connectionString, { prepare: false })

// Create the database instance
export const db = drizzle(client, { schema })

export * from "./schema"
