import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"
import * as schema from "./db/schema"

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables. Please add these to your Vercel project settings.",
  )
}

const baseUrl =
  process.env.BETTER_AUTH_URL ||
  (process.env.NODE_ENV === "development"
    ? "https://kandid-assignment-harshit.vercel.app"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://kandid-assignment-harshit.vercel.app")

console.log("[v0] Better Auth URL:", baseUrl)

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: baseUrl,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true for production
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${baseUrl}/api/auth/callback/google`,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  callbacks: {
    async signIn() {
      // Allow all sign-ins for now
      return true
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Redirect to callback page after OAuth
      if (url.includes("/api/auth/callback/")) {
        return `${baseUrl}/auth/callback`
      }
      // Default redirect to dashboard
      return `${baseUrl}/dashboard`
    },
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
})

export type Session = typeof auth.$Infer.Session
