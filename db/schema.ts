import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Lag, komité, barnehage — koblet til én innlogget bruker (auth.users). */
export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().unique(),
    name: text("name").notNull(),
    /** Lagtype (golfklubb, idrettslag, 17mai, barnehage, annet, …) */
    type: text("type"),
    /** Kommune (valgfritt) */
    municipality: text("municipality"),
    contactName: text("contact_name"),
    phone: text("phone"),
    postalCode: text("postal_code"),
    city: text("city"),
    orgNr: text("org_nr"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("organizations_user_id_idx").on(t.userId)]
);

/** Bedrift som kan sponse — koblet til én innlogget bruker. */
export const sponsors = pgTable(
  "sponsors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().unique(),
    companyName: text("company_name").notNull(),
    organizationNumber: text("organization_number"),
    contactName: text("contact_name"),
    /** Årlig sponsorbudsjett i øre (valgfritt — brukt i bedrift-dashboard). */
    annualBudgetOre: integer("annual_budget_ore"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("sponsors_user_id_idx").on(t.userId)]
);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "active",
  "completed",
  "cancelled",
]);

/** Sponsorsøknad per arrangement. */
export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    campaignType: text("campaign_type").notNull(),
    amountOre: integer("amount_ore").notNull(),
    eventDate: timestamp("event_date", { withTimezone: true, mode: "string" }),
    quantity: integer("quantity"),
    exposureDescription: text("exposure_description"),
    /** Public read-only sponsor landing page (`/sponsor/[token]`). */
    sponsorShareToken: text("sponsor_share_token"),
    status: campaignStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("campaigns_organization_id_idx").on(t.organizationId),
    index("campaigns_status_idx").on(t.status),
    uniqueIndex("campaigns_sponsor_share_token_uidx").on(t.sponsorShareToken),
  ]
);

export const outreachEmailStatusEnum = pgEnum("outreach_email_status", [
  "draft",
  "sent",
  "opened",
  "failed",
]);

/** AI-genererte e-poster med tracking. */
export const outreachEmails = pgTable(
  "outreach_emails",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    /** Registrert sponsor i Støttespillet — null når målet kun finnes i Brønnøysund (utkast). */
    sponsorId: uuid("sponsor_id").references(() => sponsors.id, {
      onDelete: "cascade",
    }),
    /** Brønnøysund org.nr når sponsorId er null. */
    prospectOrgNr: text("prospect_org_nr"),
    prospectCompanyName: text("prospect_company_name"),
    toEmail: text("to_email").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    trackingToken: text("tracking_token").notNull(),
    status: outreachEmailStatusEnum("status").notNull().default("draft"),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "string" }),
    openedAt: timestamp("opened_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("outreach_emails_tracking_token_uidx").on(t.trackingToken),
    index("outreach_emails_campaign_id_idx").on(t.campaignId),
    index("outreach_emails_sponsor_id_idx").on(t.sponsorId),
  ]
);

export const matchStatusEnum = pgEnum("match_status", [
  "pending",
  "checkout",
  "paid",
  "cancelled",
]);

/** Godkjent sponsorat (etter bekreftelse / betaling). */
export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    sponsorId: uuid("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),
    status: matchStatusEnum("status").notNull().default("pending"),
    amountOre: integer("amount_ore").notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("matches_campaign_id_idx").on(t.campaignId),
    index("matches_sponsor_id_idx").on(t.sponsorId),
  ]
);

export const orderStatusEnum = pgEnum("order_status", [
  "draft",
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
]);

/** Giveaway-shop katalog (admin-styrt, synlig for lag når aktiv). */
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    priceOre: integer("price_ore").notNull(),
    supplier: text("supplier"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("products_slug_uidx").on(t.slug)]
);

/** Produktbestillinger (giveaway-shop). */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    matchId: uuid("match_id").references(() => matches.id, {
      onDelete: "set null",
    }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    /** Filled when order is placed directly by a business (no club account involved). */
    directCompanyName: text("direct_company_name"),
    directContactName: text("direct_contact_name"),
    directEmail: text("direct_email"),
    directPhone: text("direct_phone"),
    directBallName: text("direct_ball_name"),
    directDozens: integer("direct_dozens"),
    directImprintText: text("direct_imprint_text"),
    directComment: text("direct_comment"),
    quantity: integer("quantity").notNull().default(1),
    unitPriceOre: integer("unit_price_ore").notNull().default(0),
    logoStoragePath: text("logo_storage_path"),
    deliveryAddress: text("delivery_address"),
    supplierNotes: text("supplier_notes"),
    status: orderStatusEnum("status").notNull().default("draft"),
    totalOre: integer("total_ore").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("orders_organization_id_idx").on(t.organizationId),
    index("orders_match_id_idx").on(t.matchId),
    index("orders_product_id_idx").on(t.productId),
  ]
);

export const spleisTypeEnum = pgEnum("spleis_type", [
  "badstue",
  "gapahuk",
  "toalettbygg",
  "starterbod",
  "shelter",
  "utepeis",
  "led_lys",
  "storskjerm",
  "minibuss",
  "solcelle",
  "kunstgress",
  "annet",
]);

export const spleisStatusEnum = pgEnum("spleis_status", [
  "draft",
  "active",
  "funded",
  "delivered",
]);

/** Spleis-kampanjer — alle typer i CLAUDE.md §13. */
export const spleises = pgTable(
  "spleises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    type: spleisTypeEnum("type").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: spleisStatusEnum("status").notNull().default("draft"),
    targetAmountOre: integer("target_amount_ore").notNull(),
    fundedAt: timestamp("funded_at", { withTimezone: true, mode: "string" }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("spleises_organization_id_idx").on(t.organizationId)]
);

/** Postgres-type heter fortsatt sauna_slot_status (eksisterende DB); kolonnen brukes av spleis_slots. */
export const spleisSlotStatusEnum = pgEnum("sauna_slot_status", [
  "open",
  "held",
  "paid",
]);

/** Delsponsor-slots. */
export const spleisSlots = pgTable(
  "spleis_slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    spleisId: uuid("spleis_id")
      .notNull()
      .references(() => spleises.id, { onDelete: "cascade" }),
    slotIndex: integer("slot_index").notNull(),
    amountOre: integer("amount_ore").notNull(),
    sponsorId: uuid("sponsor_id").references(() => sponsors.id, {
      onDelete: "set null",
    }),
    status: spleisSlotStatusEnum("status").notNull().default("open"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("spleis_slots_spleis_id_idx").on(t.spleisId),
    uniqueIndex("spleis_slots_spleis_slot_uidx").on(t.spleisId, t.slotIndex),
  ]
);

export const socialPostStatusEnum = pgEnum("social_post_status", [
  "draft",
  "published",
]);

/** SoMe-innlegg. */
export const socialPosts = pgTable(
  "social_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    platform: text("platform").notNull(),
    externalUrl: text("external_url"),
    status: socialPostStatusEnum("status").notNull().default("draft"),
    postedAt: timestamp("posted_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("social_posts_organization_id_idx").on(t.organizationId)]
);

/** Brønnøysund-oppslag med TTL (7 dager). */
export const brregCache = pgTable(
  "brreg_cache",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationNumber: text("organization_number").notNull(),
    payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true, mode: "string" })
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" })
      .notNull(),
  },
  (t) => [
    uniqueIndex("brreg_cache_organization_number_uidx").on(
      t.organizationNumber
    ),
  ]
);

/** Toalettbygg (QR, smartlås). */
export const toiletBuildings = pgTable(
  "toilet_buildings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    locationNote: text("location_note"),
    publicSlug: text("public_slug").notNull(),
    smartlockDeviceId: text("smartlock_device_id"),
    vippsMerchantSerial: text("vipps_merchant_serial"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("toilet_buildings_public_slug_uidx").on(t.publicSlug),
    index("toilet_buildings_organization_id_idx").on(t.organizationId),
  ]
);

/** Betalte besøk (Vipps + lås-logg). */
export const toiletSessions = pgTable(
  "toilet_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    toiletBuildingId: uuid("toilet_building_id")
      .notNull()
      .references(() => toiletBuildings.id, { onDelete: "cascade" }),
    amountOre: integer("amount_ore").notNull(),
    clubShareOre: integer("club_share_ore"),
    platformShareOre: integer("platform_share_ore"),
    vippsPaymentId: text("vipps_payment_id"),
    unlockedAt: timestamp("unlocked_at", {
      withTimezone: true,
      mode: "string",
    }),
    lockedAt: timestamp("locked_at", { withTimezone: true, mode: "string" }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("toilet_sessions_toilet_building_id_idx").on(t.toiletBuildingId),
  ]
);

export const organizationsRelations = relations(organizations, ({ many }) => ({
  campaigns: many(campaigns),
  orders: many(orders),
  spleises: many(spleises),
  socialPosts: many(socialPosts),
  toiletBuildings: many(toiletBuildings),
}));

export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  outreachEmails: many(outreachEmails),
  matches: many(matches),
  spleisSlots: many(spleisSlots),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [campaigns.organizationId],
    references: [organizations.id],
  }),
  outreachEmails: many(outreachEmails),
  matches: many(matches),
}));

export const outreachEmailsRelations = relations(outreachEmails, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [outreachEmails.campaignId],
    references: [campaigns.id],
  }),
  sponsor: one(sponsors, {
    fields: [outreachEmails.sponsorId],
    references: [sponsors.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [matches.campaignId],
    references: [campaigns.id],
  }),
  sponsor: one(sponsors, {
    fields: [matches.sponsorId],
    references: [sponsors.id],
  }),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  organization: one(organizations, {
    fields: [orders.organizationId],
    references: [organizations.id],
  }),
  match: one(matches, {
    fields: [orders.matchId],
    references: [matches.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
}));

export const spleisesRelations = relations(spleises, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [spleises.organizationId],
    references: [organizations.id],
  }),
  slots: many(spleisSlots),
}));

export const spleisSlotsRelations = relations(spleisSlots, ({ one }) => ({
  spleis: one(spleises, {
    fields: [spleisSlots.spleisId],
    references: [spleises.id],
  }),
  sponsor: one(sponsors, {
    fields: [spleisSlots.sponsorId],
    references: [sponsors.id],
  }),
}));

export const socialPostsRelations = relations(socialPosts, ({ one }) => ({
  organization: one(organizations, {
    fields: [socialPosts.organizationId],
    references: [organizations.id],
  }),
}));

export const toiletBuildingsRelations = relations(
  toiletBuildings,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [toiletBuildings.organizationId],
      references: [organizations.id],
    }),
    sessions: many(toiletSessions),
  })
);

export const toiletSessionsRelations = relations(toiletSessions, ({ one }) => ({
  toiletBuilding: one(toiletBuildings, {
    fields: [toiletSessions.toiletBuildingId],
    references: [toiletBuildings.id],
  }),
}));
