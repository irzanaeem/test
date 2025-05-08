import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Medication } from "@shared/schema";

interface CartItem {
  id: number;
  medicationId: number;
  name: string;
  dosage: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  storeId: number;
  storeName: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (medication: Medication & { storeId: number; storeName: string; inventoryPrice: number }, quantity: number) => void;
  removeItem: (medicationId: number) => void;
  updateQuantity: (medicationId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  hasItems: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from local storage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse saved cart:", error);
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (
    medication: Medication & { storeId: number; storeName: string; inventoryPrice: number },
    quantity: number
  ) => {
    // Check if item from the same medication and store already exists
    const existingItemIndex = items.findIndex(
      (item) => item.medicationId === medication.id && item.storeId === medication.storeId
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      };
      setItems(updatedItems);
      toast({
        title: "Cart updated",
        description: `${medication.name} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
      });
    } else {
      // Add new item if it doesn't exist
      const newItem: CartItem = {
        id: Date.now(), // Temporary ID for the cart item
        medicationId: medication.id,
        name: medication.name,
        dosage: medication.dosage || "",
        price: medication.inventoryPrice, // Use the specific store's price
        imageUrl: medication.imageUrl || undefined,
        quantity,
        storeId: medication.storeId,
        storeName: medication.storeName,
      };
      setItems((prevItems) => [...prevItems, newItem]);
      toast({
        title: "Added to cart",
        description: `${quantity} ${medication.name} added to your cart`,
      });
    }
  };

  const removeItem = (medicationId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.medicationId !== medicationId));
    toast({
      title: "Item removed",
      description: "Item removed from cart",
    });
  };

  const updateQuantity = (medicationId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(medicationId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.medicationId === medicationId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const hasItems = items.length > 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        hasItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}