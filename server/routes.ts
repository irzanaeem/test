import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import memorystore from "memorystore";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  loginSchema 
} from "@shared/schema";

const MemoryStore = memorystore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "medifind-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
      store: new MemoryStore({ checkPeriod: 86400000 }),
    })
  );

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(loginData.username);
      if (!user || user.password !== loginData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  });

  // Store routes
  app.get("/api/stores", async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      
      let stores;
      if (query && typeof query === "string" && query.trim() !== "") {
        stores = await storage.searchStores(query);
      } else {
        stores = await storage.getStores();
      }
      
      return res.status(200).json(stores);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stores/:id", async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.params.id);
      if (isNaN(storeId)) {
        return res.status(400).json({ message: "Invalid store ID" });
      }
      
      const store = await storage.getStore(storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      return res.status(200).json(store);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Medication routes
  app.get("/api/medications", async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      
      let medications;
      if (query && typeof query === "string" && query.trim() !== "") {
        medications = await storage.searchMedications(query);
      } else {
        medications = await storage.getMedications();
      }
      
      return res.status(200).json(medications);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/medications/:id", async (req: Request, res: Response) => {
    try {
      const medicationId = parseInt(req.params.id);
      if (isNaN(medicationId)) {
        return res.status(400).json({ message: "Invalid medication ID" });
      }
      
      const medication = await storage.getMedication(medicationId);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      return res.status(200).json(medication);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Store inventory routes
  app.get("/api/stores/:storeId/inventory", async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.params.storeId);
      if (isNaN(storeId)) {
        return res.status(400).json({ message: "Invalid store ID" });
      }
      
      const store = await storage.getStore(storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      const inventory = await storage.getStoreInventory(storeId);
      return res.status(200).json(inventory);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stores/:storeId/inventory/:medicationId", async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const medicationId = parseInt(req.params.medicationId);
      
      if (isNaN(storeId) || isNaN(medicationId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const inventoryItem = await storage.getStoreInventoryItem(storeId, medicationId);
      if (!inventoryItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      return res.status(200).json(inventoryItem);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order routes
  app.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const orders = await storage.getOrdersByUserId(userId);
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the order belongs to the authenticated user
      if (order.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      return res.status(200).json(order);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      // Validate order data
      const validatedOrder = insertOrderSchema.parse({
        ...order,
        userId: req.session.userId
      });
      
      // Validate order items
      const validatedItems = z.array(insertOrderItemSchema).parse(items);
      
      // Check if store exists
      const store = await storage.getStore(validatedOrder.storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      // Verify medications exist and are in stock
      for (const item of validatedItems) {
        const inventoryItem = await storage.getStoreInventoryItem(validatedOrder.storeId, item.medicationId);
        
        if (!inventoryItem) {
          return res.status(404).json({ 
            message: `Medication with ID ${item.medicationId} not found in store inventory` 
          });
        }
        
        if (!inventoryItem.inStock || inventoryItem.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Medication with ID ${item.medicationId} is out of stock or has insufficient quantity` 
          });
        }
        
        // Update inventory quantity
        await storage.updateStoreInventory(inventoryItem.id, {
          quantity: inventoryItem.quantity - item.quantity
        });
      }
      
      // Create order
      const newOrder = await storage.createOrder(validatedOrder, validatedItems);
      return res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const notifications = await storage.getNotifications(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notifications/:id/read", requireAuth, async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      return res.status(200).json(updatedNotification);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notifications/read-all", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      await storage.markAllNotificationsAsRead(userId);
      return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // OCR route for scanning prescriptions (this will be simulated in the frontend with Tesseract.js)
  app.post("/api/ocr/scan", requireAuth, (req: Request, res: Response) => {
    // This route is just a placeholder, as the actual OCR processing will be done client-side
    // We don't need to implement anything here as Tesseract.js will handle the OCR processing
    return res.status(200).json({ message: "OCR scanning is handled client-side with Tesseract.js" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
