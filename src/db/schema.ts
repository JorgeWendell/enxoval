import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerified: boolean("email_verified").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const roomStatusEnum = pgEnum("room_status", [
  "disponivel",
  "ocupado",
  "limpeza",
  "manutencao",
  "reservado",
]);

export const roomTypeEnum = pgEnum("room_type", [
  "single",
  "double",
  "triple",
  "suite",
  "master",
]);

export const linenItemStatusEnum = pgEnum("linen_item_status", [
  "limpo",
  "sujo",
  "em_lavagem",
  "danificado",
  "estoque",
  "descartado",
]);

export const linenItemConditionEnum = pgEnum("linen_item_condition", [
  "excelente",
  "bom",
  "regular",
  "ruim",
]);

export const movementTypeEnum = pgEnum("movement_type", [
  "entrada",
  "saida",
  "lavagem",
  "descarte",
  "transferencia",
]);

export const laundryStatusEnum = pgEnum("laundry_status", [
  "coletado",
  "em_lavagem",
  "lavado",
  "entregue",
]);

export const linenCategoryEnum = pgEnum("linen_category", [
  "cama",
  "banho",
  "mesa",
  "decoracao",
  "outros",
]);

export const roomsTable = pgTable("rooms", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  floor: integer("floor").notNull(),
  block: text("block"),
  type: roomTypeEnum("type").notNull(),
  status: roomStatusEnum("status").notNull().default("disponivel"),
  capacity: integer("capacity").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const linenTypesTable = pgTable("linen_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: linenCategoryEnum("category").notNull(),
  unit: text("unit").notNull().default("unidade"),
  minStock: integer("min_stock").notNull().default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const linenItemsTable = pgTable("linen_items", {
  id: text("id").primaryKey(),
  linenTypeId: text("linen_type_id")
    .notNull()
    .references(() => linenTypesTable.id, { onDelete: "restrict" }),
  roomId: text("room_id").references(() => roomsTable.id, {
    onDelete: "set null",
  }),
  status: linenItemStatusEnum("status").notNull().default("estoque"),
  condition: linenItemConditionEnum("condition").notNull().default("excelente"),
  description: text("description"),
  purchaseDate: timestamp("purchase_date"),
  lastWashDate: timestamp("last_wash_date"),
  notes: text("notes"),
  cnpjFornecedor: text("cnpj_fornecedor"),
  nfe: text("nfe"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const linenMovementsTable = pgTable("linen_movements", {
  id: text("id").primaryKey(),
  linenItemId: text("linen_item_id")
    .notNull()
    .references(() => linenItemsTable.id, { onDelete: "cascade" }),
  fromRoomId: text("from_room_id").references(() => roomsTable.id, {
    onDelete: "set null",
  }),
  toRoomId: text("to_room_id").references(() => roomsTable.id, {
    onDelete: "set null",
  }),
  movementType: movementTypeEnum("movement_type").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const roomLinenConfigTable = pgTable("room_linen_config", {
  id: text("id").primaryKey(),
  roomType: roomTypeEnum("room_type").notNull(),
  linenTypeId: text("linen_type_id")
    .notNull()
    .references(() => linenTypesTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const laundryTable = pgTable("laundry", {
  id: text("id").primaryKey(),
  linenItemId: text("linen_item_id")
    .notNull()
    .references(() => linenItemsTable.id, { onDelete: "cascade" }),
  status: laundryStatusEnum("status").notNull().default("coletado"),
  collectedAt: timestamp("collected_at").notNull().defaultNow(),
  washedAt: timestamp("washed_at"),
  deliveredAt: timestamp("delivered_at"),
  collectedBy: text("collected_by")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  washedBy: text("washed_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  deliveredBy: text("delivered_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cleaningChecklistStatusEnum = pgEnum("cleaning_checklist_status", [
  "pendente",
  "em_andamento",
  "concluida",
  "cancelada",
]);

export const checklistItemStatusEnum = pgEnum("checklist_item_status", [
  "presente",
  "ausente",
  "danificado",
  "substituido",
  "sujo",
]);

export const roomCleaningChecklistsTable = pgTable("room_cleaning_checklists", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .notNull()
    .references(() => roomsTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  status: cleaningChecklistStatusEnum("status").notNull().default("pendente"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cleaningChecklistItemsTable = pgTable("cleaning_checklist_items", {
  id: text("id").primaryKey(),
  checklistId: text("checklist_id")
    .notNull()
    .references(() => roomCleaningChecklistsTable.id, {
      onDelete: "cascade",
    }),
  linenItemId: text("linen_item_id").references(() => linenItemsTable.id, {
    onDelete: "set null",
  }),
  linenTypeId: text("linen_type_id")
    .notNull()
    .references(() => linenTypesTable.id, { onDelete: "restrict" }),
  status: checklistItemStatusEnum("status").notNull().default("presente"),
  conditionNotes: text("condition_notes"),
  replacementItemId: text("replacement_item_id").references(
    () => linenItemsTable.id,
    { onDelete: "set null" }
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
