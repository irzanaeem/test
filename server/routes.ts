import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertOrderSchema, 
  insertOrderItemSchema,
  pakistanCities
} from "@shared/schema";
import { setupAuth } from "./auth";

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

  // Order routes
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

  app.post("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      // Validate order data
      const validatedOrder = insertOrderSchema.parse({
        ...order,
        userId: (req.user as any).id
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
      const newOrder = await storage.createOrder(validatedOrder, validatedItems);
      
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

  const httpServer = createServer(app);
  return httpServer;
}