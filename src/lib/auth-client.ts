import { createAuthClient } from "better-auth/react"

// Client-side environment variables must be prefixed with NEXT_PUBLIC_
const getBaseURL = () => {
  // In development, always use localhost
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:3000"
  }

  // Use NEXT_PUBLIC_BETTER_AUTH_URL if available (client-accessible)
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL
  }

  if (typeof window !== "undefined") {
    // For v0 preview and production, use relative URL to avoid path issues
    return ""
  }

  // Fallback for SSR
  return "http://localhost:3000"
}

const baseURL = getBaseURL()

console.log("[v0] Auth client baseURL:", baseURL)

export const authClient = createAuthClient({
  baseURL,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
