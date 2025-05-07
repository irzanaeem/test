import { 
  User, InsertUser, 
  Store, InsertStore, 
  Medication, InsertMedication, 
  StoreInventory, InsertStoreInventory,
  Order, InsertOrder, 
  OrderItem, InsertOrderItem,
  Notification, InsertNotification
} from "@shared/schema";

export interface IStorage {
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stores: Map<number, Store>;
  private medications: Map<number, Medication>;
  private storeInventory: Map<number, StoreInventory>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem[]>;
  private notifications: Map<number, Notification>;
  
  private userIdCounter: number;
  private storeIdCounter: number;
  private medicationIdCounter: number;
  private storeInventoryIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private notificationIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.stores = new Map();
    this.medications = new Map();
    this.storeInventory = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.storeIdCounter = 1;
    this.medicationIdCounter = 1;
    this.storeInventoryIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.notificationIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Add sample medications
    const medications = [
      { name: "Amoxicillin", description: "Amoxicillin is a penicillin antibiotic that fights bacteria.", dosage: "250mg capsules", price: 12.99, imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de", category: "Antibiotic", manufacturer: "Generic", sideEffects: "Diarrhea, stomach upset, headache", usageInstructions: "Take by mouth with or without food as directed by your doctor, usually every 8 or 12 hours." },
      { name: "Lisinopril", description: "Lisinopril is used to treat high blood pressure and heart failure.", dosage: "10mg tablets", price: 8.50, imageUrl: "https://images.unsplash.com/photo-1550572017-edd951b55104", category: "Blood Pressure", manufacturer: "Generic", sideEffects: "Dizziness, headache, dry cough", usageInstructions: "Take by mouth with or without food as directed by your doctor, usually once daily." },
      { name: "Metformin", description: "Metformin is used to treat type 2 diabetes.", dosage: "500mg tablets", price: 9.75, imageUrl: "https://images.unsplash.com/photo-1550572017-edd951b55104", category: "Diabetes", manufacturer: "Generic", sideEffects: "Nausea, vomiting, stomach upset", usageInstructions: "Take by mouth usually with meals to reduce stomach upset." },
      { name: "Atorvastatin", description: "Atorvastatin is used to lower cholesterol and triglycerides in the blood.", dosage: "20mg tablets", price: 11.25, imageUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6", category: "Cholesterol", manufacturer: "Generic", sideEffects: "Muscle pain, weakness, fever", usageInstructions: "Take by mouth with or without food, usually once daily." },
      { name: "Levothyroxine", description: "Levothyroxine is used to treat an underactive thyroid (hypothyroidism).", dosage: "50mcg tablets", price: 14.50, imageUrl: "https://images.unsplash.com/photo-1550572017-edd951b55104", category: "Thyroid", manufacturer: "Generic", sideEffects: "Hair loss, increased sweating, weight loss", usageInstructions: "Take on an empty stomach, 30-60 minutes before breakfast." },
      { name: "Albuterol", description: "Albuterol is used to treat asthma and COPD.", dosage: "Inhaler, 90mcg", price: 25.99, imageUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6", category: "Respiratory", manufacturer: "Generic", sideEffects: "Nervousness, shaking, headache", usageInstructions: "Inhale as directed by your doctor, usually every 4-6 hours as needed." }
    ];
    
    medications.forEach(med => {
      this.createMedication({
        name: med.name,
        description: med.description,
        dosage: med.dosage,
        manufacturer: med.manufacturer,
        category: med.category,
        price: med.price,
        imageUrl: med.imageUrl,
        sideEffects: med.sideEffects,
        usageInstructions: med.usageInstructions
      });
    });
    
    // Create sample stores
    const stores = [
      { name: "HealthPlus Pharmacy", address: "123 Main Street", city: "Anytown", zipCode: "12345", phone: "(555) 123-4567", email: "info@healthplus.com", openingHours: "Monday - Friday: 8:00 AM - 9:00 PM, Saturday: 9:00 AM - 7:00 PM, Sunday: 10:00 AM - 6:00 PM", description: "A full-service pharmacy with friendly staff.", imageUrl: "https://pixabay.com/get/g488e291b3f2a802c091ff30a91e8af7de007229ac8bcfc1ab806c63148f43313bf0bc4eb6fae367e841a4f4c1e2244adf87dab4929d6e40fd29a37ffcec18a4d_1280.jpg", rating: 4.8, reviewCount: 124, latitude: 40.7128, longitude: -74.0060, distance: 1.2 },
      { name: "MediMart Pharmacy", address: "456 Oak Avenue", city: "Anytown", zipCode: "12345", phone: "(555) 234-5678", email: "info@medimart.com", openingHours: "Monday - Friday: 8:00 AM - 8:00 PM, Saturday: 9:00 AM - 6:00 PM, Sunday: 10:00 AM - 5:00 PM", description: "We offer a wide range of health products.", imageUrl: "https://images.unsplash.com/photo-1573883431205-98b5f10aaedb", rating: 4.6, reviewCount: 87, latitude: 40.7282, longitude: -74.0776, distance: 2.4 },
      { name: "CarePlus Pharmacy", address: "789 Pine Road", city: "Anytown", zipCode: "12345", phone: "(555) 345-6789", email: "info@careplus.com", openingHours: "Monday - Friday: 7:00 AM - 10:00 PM, Saturday: 8:00 AM - 8:00 PM, Sunday: 9:00 AM - 7:00 PM", description: "Your health is our priority.", imageUrl: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926", rating: 4.7, reviewCount: 103, latitude: 40.7332, longitude: -73.9879, distance: 0.8 },
      { name: "MedExpress Pharmacy", address: "321 Elm Street", city: "Anytown", zipCode: "12345", phone: "(555) 456-7890", email: "info@medexpress.com", openingHours: "Monday - Friday: 8:00 AM - 9:00 PM, Saturday: 9:00 AM - 7:00 PM, Sunday: Closed", description: "Fast service for all your medication needs.", imageUrl: "https://pixabay.com/get/g2dc23a6ff948334d8265b0e2fc6e949c6d589a555c9d042706686ee3a160b44f6e0d453b49b6dedbff1ce7465f26d33367cfd43bbbcabc5ab94c507074850e9c_1280.jpg", rating: 4.5, reviewCount: 76, latitude: 40.7515, longitude: -73.9898, distance: 3.1 }
    ];
    
    // Create admin user for stores
    const adminUser: InsertUser = {
      username: "admin",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      phone: "(555) 987-6543",
      address: "100 Admin St, Adminville, 10001",
      isStore: true
    };
    
    const user = this.createUser(adminUser);
    
    stores.forEach(store => {
      this.createStore({
        userId: user.id,
        name: store.name,
        address: store.address,
        city: store.city,
        zipCode: store.zipCode,
        phone: store.phone,
        email: store.email,
        openingHours: store.openingHours,
        description: store.description,
        imageUrl: store.imageUrl,
        latitude: store.latitude,
        longitude: store.longitude,
        rating: store.rating,
        reviewCount: store.reviewCount,
        distance: store.distance
      });
    });
    
    // Add medications to store inventory
    for (let storeId = 1; storeId <= stores.length; storeId++) {
      for (let medId = 1; medId <= medications.length; medId++) {
        // Some medications are out of stock or low stock for variety
        let inStock = true;
        let quantity = 100;
        
        if (storeId === 4 && medId === 6) {
          inStock = false;
          quantity = 0;
        } else if (storeId === 1 && medId === 5) {
          quantity = 5; // Low stock
        }
        
        this.createStoreInventory({
          storeId,
          medicationId: medId,
          inStock,
          quantity,
          price: medications[medId - 1].price
        });
      }
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { id, ...user };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Store operations
  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }
  
  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }
  
  async getStoresByUserID(userId: number): Promise<Store[]> {
    return Array.from(this.stores.values()).filter(store => store.userId === userId);
  }
  
  async createStore(store: InsertStore): Promise<Store> {
    const id = this.storeIdCounter++;
    const newStore: Store = { 
      id, 
      ...store, 
      rating: store.rating || 0,
      reviewCount: store.reviewCount || 0,
      distance: store.distance || 0
    };
    this.stores.set(id, newStore);
    return newStore;
  }
  
  async updateStore(id: number, storeData: Partial<Store>): Promise<Store | undefined> {
    const store = this.stores.get(id);
    if (!store) return undefined;
    
    const updatedStore = { ...store, ...storeData };
    this.stores.set(id, updatedStore);
    return updatedStore;
  }
  
  async searchStores(query: string): Promise<Store[]> {
    query = query.toLowerCase();
    return Array.from(this.stores.values()).filter(store => 
      store.name.toLowerCase().includes(query) || 
      store.address.toLowerCase().includes(query) ||
      store.city.toLowerCase().includes(query) ||
      store.zipCode.toLowerCase().includes(query)
    );
  }
  
  // Medication operations
  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }
  
  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }
  
  async createMedication(medication: InsertMedication): Promise<Medication> {
    const id = this.medicationIdCounter++;
    const newMedication: Medication = { id, ...medication };
    this.medications.set(id, newMedication);
    return newMedication;
  }
  
  async updateMedication(id: number, medicationData: Partial<Medication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;
    
    const updatedMedication = { ...medication, ...medicationData };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }
  
  async searchMedications(query: string): Promise<Medication[]> {
    query = query.toLowerCase();
    return Array.from(this.medications.values()).filter(med => 
      med.name.toLowerCase().includes(query) || 
      (med.description && med.description.toLowerCase().includes(query)) ||
      (med.category && med.category.toLowerCase().includes(query))
    );
  }
  
  // Store Inventory operations
  async getStoreInventory(storeId: number): Promise<(StoreInventory & { medication: Medication })[]> {
    const inventory = Array.from(this.storeInventory.values())
      .filter(item => item.storeId === storeId);
    
    return inventory.map(item => {
      const medication = this.medications.get(item.medicationId);
      if (!medication) throw new Error(`Medication with ID ${item.medicationId} not found`);
      return { ...item, medication };
    });
  }
  
  async getStoreInventoryItem(storeId: number, medicationId: number): Promise<(StoreInventory & { medication: Medication }) | undefined> {
    const item = Array.from(this.storeInventory.values())
      .find(item => item.storeId === storeId && item.medicationId === medicationId);
    
    if (!item) return undefined;
    
    const medication = this.medications.get(item.medicationId);
    if (!medication) return undefined;
    
    return { ...item, medication };
  }
  
  async createStoreInventory(inventory: InsertStoreInventory): Promise<StoreInventory> {
    const id = this.storeInventoryIdCounter++;
    const newInventory: StoreInventory = { id, ...inventory };
    this.storeInventory.set(id, newInventory);
    return newInventory;
  }
  
  async updateStoreInventory(id: number, inventoryData: Partial<StoreInventory>): Promise<StoreInventory | undefined> {
    const inventory = this.storeInventory.get(id);
    if (!inventory) return undefined;
    
    const updatedInventory = { ...inventory, ...inventoryData };
    this.storeInventory.set(id, updatedInventory);
    return updatedInventory;
  }
  
  // Order operations
  async getOrder(id: number): Promise<(Order & { items: (OrderItem & { medication: Medication })[] }) | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = this.orderItems.get(id) || [];
    const itemsWithMedications = items.map(item => {
      const medication = this.medications.get(item.medicationId);
      if (!medication) throw new Error(`Medication with ID ${item.medicationId} not found`);
      return { ...item, medication };
    });
    
    return { ...order, items: itemsWithMedications };
  }
  
  async getOrdersByUserId(userId: number): Promise<(Order & { store: Store, items: (OrderItem & { medication: Medication })[] })[]> {
    const userOrders = Array.from(this.orders.values())
      .filter(order => order.userId === userId);
    
    return Promise.all(userOrders.map(async order => {
      const store = this.stores.get(order.storeId);
      if (!store) throw new Error(`Store with ID ${order.storeId} not found`);
      
      const items = this.orderItems.get(order.id) || [];
      const itemsWithMedications = items.map(item => {
        const medication = this.medications.get(item.medicationId);
        if (!medication) throw new Error(`Medication with ID ${item.medicationId} not found`);
        return { ...item, medication };
      });
      
      return { ...order, store, items: itemsWithMedications };
    }));
  }
  
  async getOrdersByStoreId(storeId: number): Promise<(Order & { user: User, items: (OrderItem & { medication: Medication })[] })[]> {
    const storeOrders = Array.from(this.orders.values())
      .filter(order => order.storeId === storeId);
    
    return Promise.all(storeOrders.map(async order => {
      const user = this.users.get(order.userId);
      if (!user) throw new Error(`User with ID ${order.userId} not found`);
      
      const items = this.orderItems.get(order.id) || [];
      const itemsWithMedications = items.map(item => {
        const medication = this.medications.get(item.medicationId);
        if (!medication) throw new Error(`Medication with ID ${item.medicationId} not found`);
        return { ...item, medication };
      });
      
      return { ...order, user, items: itemsWithMedications };
    }));
  }
  
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const orderId = this.orderIdCounter++;
    const createdAt = new Date();
    
    const newOrder: Order = { 
      id: orderId, 
      ...order, 
      createdAt
    };
    
    this.orders.set(orderId, newOrder);
    
    // Create order items
    const orderItems: OrderItem[] = items.map(item => ({
      id: this.orderItemIdCounter++,
      orderId,
      ...item
    }));
    
    this.orderItems.set(orderId, orderItems);
    
    // Create notifications for user and store
    this.createNotification({
      userId: order.userId,
      title: "Order Placed Successfully",
      message: `Your order #ORD${orderId} has been placed successfully.`,
      type: "order",
      relatedOrderId: orderId
    });
    
    // Get store owner (user ID) and send notification
    const store = this.stores.get(order.storeId);
    if (store) {
      this.createNotification({
        userId: store.userId,
        title: "New Order Received",
        message: `Order #ORD${orderId} has been placed at your store.`,
        type: "order",
        relatedOrderId: orderId
      });
    }
    
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    
    // Create notification for status update
    let notificationTitle = "";
    let notificationMessage = "";
    
    switch (status) {
      case "ready":
        notificationTitle = "Order Ready for Pickup";
        notificationMessage = `Your order #ORD${id} is ready for pickup.`;
        break;
      case "completed":
        notificationTitle = "Order Completed";
        notificationMessage = `Your order #ORD${id} has been completed.`;
        break;
      case "cancelled":
        notificationTitle = "Order Cancelled";
        notificationMessage = `Your order #ORD${id} has been cancelled.`;
        break;
      default:
        notificationTitle = "Order Status Updated";
        notificationMessage = `Your order #ORD${id} status has been updated to ${status}.`;
    }
    
    this.createNotification({
      userId: order.userId,
      title: notificationTitle,
      message: notificationMessage,
      type: "order",
      relatedOrderId: id
    });
    
    return updatedOrder;
  }
  
  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => {
        // Sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const newNotification: Notification = { 
      id, 
      ...notification, 
      read: false,
      createdAt: new Date()
    };
    
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId);
    
    userNotifications.forEach(notification => {
      this.notifications.set(notification.id, { ...notification, read: true });
    });
  }
}

export const storage = new MemStorage();
