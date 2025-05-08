import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { UploadedFile } from "express-fileupload";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertOrderSchema, 
  insertOrderItemSchema,
  insertStoreInventorySchema,
  pakistanCities
} from "@shared/schema";
import { setupAuth } from "./auth";

// Import FileArray type
import { FileArray } from "express-fileupload";

// Extend Express Request type to include files
declare global {
  namespace Express {
    interface Request {
      files?: FileArray | null;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Auth middleware - uses Passport
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Store routes
  app.get("/api/stores", async (req: Request, res: Response) => {
    try {
      const { query, city } = req.query;
      
      let stores;
      
      // Filter by user's city if authenticated
      if (req.isAuthenticated() && !city) {
        const userCity = (req.user as any).city;
        stores = await storage.getStoresByCity(userCity);
      } 
      // Filter by specific city if provided in query
      else if (city && typeof city === "string" && pakistanCities.includes(city as any)) {
        stores = await storage.getStoresByCity(city);
      }
      // Search by query if provided
      else if (query && typeof query === "string" && query.trim() !== "") {
        stores = await storage.searchStores(query);
      } 
      // Otherwise get all stores
      else {
        stores = await storage.getStores();
      }
      
      return res.status(200).json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get stores owned by the authenticated user
  app.get("/api/stores/user", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const stores = await storage.getStoresByUserID(userId);
      return res.status(200).json(stores);
    } catch (error) {
      console.error("Error fetching user stores:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create a new store (pharmacy)
  app.post("/api/stores", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!(req.user as any).isStore) {
        return res.status(403).json({ message: "Only store owners can create pharmacies" });
      }
      
      const userId = (req.user as any).id;
      
      // Handle FormData or JSON
      let storeData;
      let imageUrl = null;
      
      if (req.is('multipart/form-data')) {
        // Process form data
        const { name, address, city, zipCode, phone, email, openingHours, description } = req.body;
        
        // Extract image if present
        if (req.files && req.files.image) {
          const imageFile = Array.isArray(req.files.image) 
            ? req.files.image[0] 
            : req.files.image;
          
          // Here you would normally upload the file to cloud storage
          // For now, we'll use a placeholder or the URL if provided
          imageUrl = `https://i.ibb.co/DDkqJ7w/pharmacy4.jpg`;
        }
        
        storeData = {
          name,
          address,
          city,
          zipCode,
          phone,
          email,
          openingHours,
          description,
          imageUrl: imageUrl || `https://i.ibb.co/HTT4Ljh/pharmacy1.jpg`,
          rating: 0,
          reviewCount: 0,
          userId
        };
      } else {
        // Process JSON data
        storeData = {
          ...req.body,
          imageUrl: req.body.imageUrl || `https://i.ibb.co/HTT4Ljh/pharmacy1.jpg`,
          rating: 0,
          reviewCount: 0,
          userId
        };
      }
      
      const newStore = await storage.createStore(storeData);
      return res.status(201).json(newStore);
    } catch (error: any) {
      console.error("Error creating store:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
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
      console.error("Error fetching store:", error);
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
      console.error("Error fetching medications:", error);
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
      console.error("Error fetching medication:", error);
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
      console.error("Error fetching inventory:", error);
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
      console.error("Error fetching inventory item:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order routes - specific routes first, general routes later
  
  // Get orders for a specific store (store owner only)
  app.get("/api/orders/store/:storeId", requireAuth, async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.params.storeId);
      if (isNaN(storeId)) {
        return res.status(400).json({ message: "Invalid store ID" });
      }
      
      // Get the store to verify ownership
      const store = await storage.getStore(storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      // Check if the authenticated user is the store owner
      if (store.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: You are not the owner of this store" });
      }
      
      const orders = await storage.getOrdersByStoreId(storeId);
      return res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching store orders:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all orders for the current user
  app.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const orders = await storage.getOrdersByUserId(userId);
      return res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
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
      if (order.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      return res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // PATCH route to update order status
  app.patch("/api/orders/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const { status } = req.body;
      if (!status || !["pending", "processing", "ready", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      // Get the order to check ownership
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // For store owners, verify they own the store where the order was placed
      if ((req.user as any).isStore) {
        const userStores = await storage.getStoresByUserID((req.user as any).id);
        const storeIds = userStores.map(store => store.id);
        
        if (!storeIds.includes(order.storeId)) {
          return res.status(403).json({ message: "Forbidden: You do not own this store" });
        }
      } 
      // For regular users, check if the order belongs to them
      else if (order.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: This is not your order" });
      }
      
      // Update order status
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // POST route to add a product to store inventory
  app.post("/api/stores/:storeId/inventory", requireAuth, async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.params.storeId);
      if (isNaN(storeId)) {
        return res.status(400).json({ message: "Invalid store ID" });
      }
      
      // Check if the store belongs to the authenticated user
      const store = await storage.getStore(storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      if (store.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: You do not own this store" });
      }
      
      const { medicationId, price, quantity } = req.body;
      
      // Validate inventory data
      const inStock = quantity > 0;
      const validatedInventory = insertStoreInventorySchema.parse({
        storeId,
        medicationId,
        price,
        quantity,
        inStock
      });
      
      // Create inventory item
      const inventoryItem = await storage.createStoreInventory(validatedInventory);
      
      // Get the medication details to include in the response
      const medication = await storage.getMedication(medicationId);
      
      return res.status(201).json({
        ...inventoryItem,
        medication
      });
    } catch (error) {
      console.error("Error adding inventory item:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // PATCH route to update a store inventory item
  app.patch("/api/stores/:storeId/inventory/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const inventoryId = parseInt(req.params.id);
      
      if (isNaN(storeId) || isNaN(inventoryId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Check if the store belongs to the authenticated user
      const store = await storage.getStore(storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      if (store.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: You do not own this store" });
      }
      
      const { price, quantity } = req.body;
      
      // Update inventory with new data
      const inStock = quantity > 0;
      const updatedInventory = await storage.updateStoreInventory(inventoryId, {
        price,
        quantity,
        inStock
      });
      
      if (!updatedInventory) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      // Get the full inventory item with medication details
      const inventoryItem = await storage.getStoreInventoryItem(storeId, updatedInventory.medicationId);
      
      return res.status(200).json(inventoryItem);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      // Validate order data
      const validatedOrder = insertOrderSchema.parse({
        ...order,
        userId: (req.user as any).id
      });
      
      // Only validate basic properties of items (not orderId yet)
      const itemsToValidate = items.map((item: { medicationId: number | string, quantity: number | string, price: number | string }) => ({
        medicationId: Number(item.medicationId),
        quantity: Number(item.quantity),
        price: Number(item.price)
      }));
      
      // Check if store exists
      const store = await storage.getStore(validatedOrder.storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      // Verify medications exist and are in stock
      for (const item of itemsToValidate) {
        const inventoryItem = await storage.getStoreInventoryItem(validatedOrder.storeId, item.medicationId);
        
        if (!inventoryItem) {
          return res.status(404).json({ 
            message: `Medication with ID ${item.medicationId} not found in store inventory` 
          });
        }
        
        // Safely handle quantity checks
        const quantity = inventoryItem.quantity ?? 0;
        if (!inventoryItem.inStock || quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Medication with ID ${item.medicationId} is out of stock or has insufficient quantity` 
          });
        }
        
        // Update inventory quantity
        await storage.updateStoreInventory(inventoryItem.id, {
          quantity: quantity - item.quantity
        });
      }
      
      // Create order
      const newOrder = await storage.createOrder(validatedOrder, itemsToValidate);
      
      // Create notification for user
      await storage.createNotification({
        userId: (req.user as any).id,
        title: "Order Placed",
        message: `Your order #${newOrder.id} has been placed successfully.`,
        type: "order",
        relatedOrderId: newOrder.id
      });
      
      return res.status(201).json(newOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const notifications = await storage.getNotifications(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
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
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notifications/read-all", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      await storage.markAllNotificationsAsRead(userId);
      return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // OCR route for scanning prescriptions (this will be simulated in the frontend with Tesseract.js)
  app.post("/api/ocr/scan", requireAuth, (req: Request, res: Response) => {
    // This route is just a placeholder, as the actual OCR processing will be done client-side
    // We don't need to implement anything here as Tesseract.js will handle the OCR processing
    return res.status(200).json({ message: "OCR scanning is handled client-side with Tesseract.js" });
  });
  
  // Cities endpoint for the frontend to get available Pakistan cities
  app.get("/api/cities", (req: Request, res: Response) => {
    return res.status(200).json(pakistanCities);
  });
  
  // Seed data endpoint (for development purposes only)
  app.post("/api/seed-data", async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Seeding not allowed in production" });
    }
    
    try {
      const { seedData } = await import("./seed-data");
      await seedData();
      return res.status(200).json({ message: "Data seeded successfully" });
    } catch (error) {
      console.error("Error seeding data:", error);
      return res.status(500).json({ message: "Error seeding data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}