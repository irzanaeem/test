import { db } from "./db";
import { eq, and, like, desc } from "drizzle-orm";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";
import { 
  users, medications, stores, storeInventory, orders, orderItems, notifications,
  User, InsertUser, Store, InsertStore, Medication, InsertMedication,
  StoreInventory, InsertStoreInventory, Order, InsertOrder, OrderItem, InsertOrderItem,
  Notification, InsertNotification
} from "@shared/schema";
import { IStorage } from "./types";

const SQLiteStoreSession = SQLiteStore(session);

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Store operations
  getStore(id: number): Promise<Store | undefined>;
  getStores(): Promise<Store[]>;
  getStoresByUserID(userId: number): Promise<Store[]>;
  getStoresByCity(city: string): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: Partial<Store>): Promise<Store | undefined>;
  searchStores(query: string): Promise<Store[]>;
  
  // Medication operations
  getMedication(id: number): Promise<Medication | undefined>;
  getMedications(): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<Medication>): Promise<Medication | undefined>;
  searchMedications(query: string): Promise<Medication[]>;
  
  // Store Inventory operations
  getStoreInventory(storeId: number): Promise<(StoreInventory & { medication: Medication })[]>;
  getStoreInventoryItem(storeId: number, medicationId: number): Promise<(StoreInventory & { medication: Medication }) | undefined>;
  createStoreInventory(inventory: InsertStoreInventory): Promise<StoreInventory>;
  updateStoreInventory(id: number, inventory: Partial<StoreInventory>): Promise<StoreInventory | undefined>;
  
  // Order operations
  getOrder(id: number): Promise<(Order & { items: (OrderItem & { medication: Medication })[] }) | undefined>;
  getOrdersByUserId(userId: number): Promise<(Order & { store: Store, items: (OrderItem & { medication: Medication })[] })[]>;
  getOrdersByStoreId(storeId: number): Promise<(Order & { user: User, items: (OrderItem & { medication: Medication })[] })[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private sessionStore: any;

  constructor() {
    this.sessionStore = new SQLiteStoreSession({
      db: "sessions.db",
      dir: "./",
      table: "sessions"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const { agreeToTerms, ...userDataWithoutTerms } = userData;
    const [user] = await db.insert(users).values(userDataWithoutTerms).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Store operations
  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async getStores(): Promise<Store[]> {
    return await db.select().from(stores);
  }

  async getStoresByUserID(userId: number): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.userId, userId));
  }

  async getStoresByCity(city: string): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.city, city));
  }

  async createStore(storeData: InsertStore): Promise<Store> {
    const [store] = await db.insert(stores).values(storeData).returning();
    return store;
  }

  async updateStore(id: number, storeData: Partial<Store>): Promise<Store | undefined> {
    const [updatedStore] = await db
      .update(stores)
      .set(storeData)
      .where(eq(stores.id, id))
      .returning();
    return updatedStore;
  }

  async searchStores(query: string): Promise<Store[]> {
    return await db
      .select()
      .from(stores)
      .where(like(stores.name, `%${query}%`));
  }

  // Medication operations
  async getMedication(id: number): Promise<Medication | undefined> {
    const [medication] = await db.select().from(medications).where(eq(medications.id, id));
    return medication;
  }

  async getMedications(): Promise<Medication[]> {
    return await db.select().from(medications);
  }

  async createMedication(medicationData: InsertMedication): Promise<Medication> {
    const [medication] = await db.insert(medications).values(medicationData).returning();
    return medication;
  }

  async updateMedication(id: number, medicationData: Partial<Medication>): Promise<Medication | undefined> {
    const [updatedMedication] = await db
      .update(medications)
      .set(medicationData)
      .where(eq(medications.id, id))
      .returning();
    return updatedMedication;
  }

  async searchMedications(query: string): Promise<Medication[]> {
    return await db
      .select()
      .from(medications)
      .where(like(medications.name, `%${query}%`));
  }

  // Store Inventory operations
  async getStoreInventory(storeId: number): Promise<(StoreInventory & { medication: Medication })[]> {
    const inventory = await db
      .select()
      .from(storeInventory)
      .where(eq(storeInventory.storeId, storeId));

    const result = [];
    for (const item of inventory) {
      const medication = await this.getMedication(item.medicationId);
      if (medication) {
        result.push({
          ...item,
          medication
        });
      }
    }
    return result;
  }

  async getStoreInventoryItem(storeId: number, medicationId: number): Promise<(StoreInventory & { medication: Medication }) | undefined> {
    const [item] = await db
      .select()
      .from(storeInventory)
      .where(
        and(
          eq(storeInventory.storeId, storeId),
          eq(storeInventory.medicationId, medicationId)
        )
      );

    if (!item) return undefined;

    const medication = await this.getMedication(item.medicationId);
    if (!medication) return undefined;

    return {
      ...item,
      medication
    };
  }

  async createStoreInventory(inventoryData: InsertStoreInventory): Promise<StoreInventory> {
    const [inventory] = await db.insert(storeInventory).values(inventoryData).returning();
    return inventory;
  }

  async updateStoreInventory(id: number, inventoryData: Partial<StoreInventory>): Promise<StoreInventory | undefined> {
    const [updatedInventory] = await db
      .update(storeInventory)
      .set(inventoryData)
      .where(eq(storeInventory.id, id))
      .returning();
    return updatedInventory;
  }

  // Order operations
  async getOrder(id: number): Promise<(Order & { items: (OrderItem & { medication: Medication })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const orderItemsList = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    const items = [];
    for (const item of orderItemsList) {
      const medication = await this.getMedication(item.medicationId);
      if (medication) {
        items.push({
          ...item,
          medication
        });
      }
    }

    return {
      ...order,
      items
    };
  }

  async getOrdersByUserId(userId: number): Promise<(Order & { store: Store; items: (OrderItem & { medication: Medication })[] })[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const result = [];
    for (const order of userOrders) {
      const store = await this.getStore(order.storeId);
      if (!store) continue;

      const orderItemsList = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      const items = [];
      for (const item of orderItemsList) {
        const medication = await this.getMedication(item.medicationId);
        if (medication) {
          items.push({
            ...item,
            medication
          });
        }
      }

      result.push({
        ...order,
        store,
        items
      });
    }

    return result;
  }

  async getOrdersByStoreId(storeId: number): Promise<(Order & { user: User; items: (OrderItem & { medication: Medication })[] })[]> {
    const storeOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.storeId, storeId))
      .orderBy(desc(orders.createdAt));

    const result = [];
    for (const order of storeOrders) {
      const user = await this.getUser(order.userId);
      if (!user) continue;

      const orderItemsList = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      const items = [];
      for (const item of orderItemsList) {
        const medication = await this.getMedication(item.medicationId);
        if (medication) {
          items.push({
            ...item,
            medication
          });
        }
      }

      result.push({
        ...order,
        user,
        items
      });
    }

    return result;
  }

  async createOrder(orderData: InsertOrder, itemsData: any[]): Promise<Order> {
    // Insert order first
    const [order] = await db.insert(orders).values(orderData).returning();

    // Insert order items with proper type handling
    for (const item of itemsData) {
      await db.insert(orderItems).values({
        medicationId: Number(item.medicationId),
        quantity: Number(item.quantity),
        price: Number(item.price),
        orderId: Number(order.id)
      });
    }

    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }
}

export const storage = new DatabaseStorage();