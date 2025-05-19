import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Model
const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  isStore: integer("is_store").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Store Model
const stores = sqliteTable("stores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  openingHours: text("opening_hours").notNull(),
  description: text("description"),
  rating: text("rating"),
  reviewCount: integer("review_count").default(0),
  imageUrl: text("image_url"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  distance: text("distance"),
});

// Medication Model
const medications = sqliteTable("medications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  dosage: text("dosage"),
  manufacturer: text("manufacturer"),
  category: text("category"),
  price: text("price").notNull(),
  imageUrl: text("image_url"),
  sideEffects: text("side_effects"),
  usageInstructions: text("usage_instructions"),
});

// Store Inventory Model
const storeInventory = sqliteTable("store_inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  storeId: integer("store_id").notNull().references(() => stores.id),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  inStock: integer("in_stock").default(1),
  quantity: integer("quantity").default(0),
  price: text("price"),
});

// Order Model
const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  storeId: integer("store_id").notNull().references(() => stores.id),
  status: text("status").notNull().default("pending"),
  totalAmount: text("total_amount").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  pickupTime: text("pickup_time"),
  notes: text("notes"),
});

// Order Item Model
const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  quantity: integer("quantity").notNull(),
  price: text("price").notNull(),
});

// Notification Model
const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  read: integer("read").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  relatedOrderId: integer("related_order_id").references(() => orders.id),
});

// Pakistan cities
const pakistanCities = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Faisalabad",
  "Rawalpindi",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
] as const;

type PakistanCity = typeof pakistanCities[number];

// Schemas for inserts with validation
const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    address: true,
    city: true,
    isStore: true,
  })
  .extend({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    email: z.string().email("Please enter a valid email address"),
    city: z.custom<PakistanCity>((val) => pakistanCities.includes(val as PakistanCity), {
      message: "Please select a valid city in Pakistan",
    }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  });

const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  rating: true,
  reviewCount: true,
  distance: true,
});

const insertMedicationSchema = createInsertSchema(medications).omit({ id: true });

const insertStoreInventorySchema = createInsertSchema(storeInventory).omit({ id: true });

const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });

const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  read: true,
});

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Add isStore field to signup schema
const signupSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  agreeToTerms: z.boolean(),
  isStore: z.boolean().optional().default(false),
});
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type StoreInventory = typeof storeInventory.$inferSelect;
export type InsertStoreInventory = z.infer<typeof insertStoreInventorySchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Login = z.infer<typeof loginSchema>;

export {
  insertMedicationSchema,
  insertNotificationSchema,
  insertOrderItemSchema,
  insertOrderSchema,
  insertStoreInventorySchema,
  insertStoreSchema,
  insertUserSchema,
  loginSchema,
  medications,
  notifications,
  orderItems,
  orders,
  pakistanCities,
  signupSchema,
  storeInventory,
  stores,
  users,
};
