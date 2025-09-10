import { pgTable, text, timestamp, integer, boolean, uuid, decimal } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const campaignStatusEnum = ["draft", "active", "paused", "completed"] as const
export const leadStatusEnum = ["pending", "contacted", "responded", "converted", "do_not_contact"] as const
export const interactionTypeEnum = [
  "invitation_request",
  "connection_status",
  "connection_acceptance",
  "followup",
] as const
export const interactionStatusEnum = ["pending", "sent", "delivered", "read", "responded"] as const

// Users table (handled by Better Auth)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  name: text("name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  image: text("image"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Sessions table (Better Auth)
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Accounts table (Better Auth - for OAuth)
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  providerId: text("provider_id").notNull(),
  accountId: text("account_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Verification table (Better Auth)
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  value: text("value").notNull(),
  identifier: text("identifier").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  status: text("status", {
    enum: campaignStatusEnum,
  })
    .default("draft")
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  totalLeads: integer("total_leads").default(0),
  successfulLeads: integer("successful_leads").default(0),
  responseRate: decimal("response_rate", { precision: 5, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Leads table
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  jobTitle: text("job_title"),
  description: text("description"),
  status: text("status", {
    enum: leadStatusEnum,
  })
    .default("pending")
    .notNull(),
  campaignId: uuid("campaign_id")
    .references(() => campaigns.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  lastContactedAt: timestamp("last_contacted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Lead interactions/activity table
export const leadInteractions = pgTable("lead_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .references(() => leads.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type", {
    enum: interactionTypeEnum,
  }).notNull(),
  message: text("message"),
  status: text("status", {
    enum: interactionStatusEnum,
  })
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

export const insertCampaignSchema = createInsertSchema(campaigns)
export const selectCampaignSchema = createSelectSchema(campaigns)

export const insertLeadSchema = createInsertSchema(leads)
export const selectLeadSchema = createSelectSchema(leads)

export const insertLeadInteractionSchema = createInsertSchema(leadInteractions)
export const selectLeadInteractionSchema = createSelectSchema(leadInteractions)

export type CampaignStatus = (typeof campaignStatusEnum)[number]
export type LeadStatus = (typeof leadStatusEnum)[number]
export type InteractionType = (typeof interactionTypeEnum)[number]
export type InteractionStatus = (typeof interactionStatusEnum)[number]

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Campaign = typeof campaigns.$inferSelect
export type NewCampaign = typeof campaigns.$inferInsert

export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert

export type LeadInteraction = typeof leadInteractions.$inferSelect
export type NewLeadInteraction = typeof leadInteractions.$inferInsert
