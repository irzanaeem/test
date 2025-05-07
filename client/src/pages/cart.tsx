import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CartItem from "@/components/cart/cart-item";
import CheckoutForm from "@/components/cart/checkout-form";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface CartItemType {
  id: number;
  name: string;
  dosage: string;
  price: number;
  imageUrl: string;
  quantity: number;
  storeId: number;
  storeName: string;
}

interface CheckoutFormData {
  fullName: string;
  phone: string;
  pickupTime: string;
  paymentMethod: string;
  notes: string;
}

const CartPage = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.09; // 9% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  // Get cart from localStorage on component mount
  useEffect(() => {
    const cartJSON = localStorage.getItem('cart');
    if (cartJSON) {
      setCartItems(JSON.parse(cartJSON));
    }
  }, []);
  
  // Group items by store
  const storeGroups = cartItems.reduce((groups: Record<number, CartItemType[]>, item) => {
    if (!groups[item.storeId]) {
      groups[item.storeId] = [];
    }
    groups[item.storeId].push(item);
    return groups;
  }, {});
  
  const storeNames = Object.entries(storeGroups).reduce((names: Record<number, string>, [storeId, items]) => {
    names[parseInt(storeId)] = items[0].storeName;
    return names;
  }, {});
  
  const updateCartItem = (id: number, quantity: number) => {
    const updatedItems = cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };
  
  const removeCartItem = (id: number) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    });
  };
  
  const handleBackClick = () => {
    setLocation("/stores");
  };
  
  const handleContinueShopping = () => {
    setLocation("/stores");
  };
  
  const handleCheckout = async (formData: CheckoutFormData) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }
    
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checking out.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Group items by store and create orders for each store
      const storeIds = [...new Set(cartItems.map(item => item.storeId))];
      
      // For simplicity, we'll just handle the first store in the cart
      // In a real app, you might want to handle multiple stores differently
      const storeId = storeIds[0];
      const storeItems = cartItems.filter(item => item.storeId === storeId);
      
      // Prepare order data
      const orderData = {
        order: {
          storeId,
          totalAmount: total,
          status: "pending",
          pickupTime: formData.pickupTime,
          notes: formData.notes || undefined,
        },
        items: storeItems.map(item => ({
          medicationId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      
      // Submit order
      const response = await apiRequest("POST", "/api/orders", orderData);
      const newOrder = await response.json();
      
      // Clear cart
      localStorage.removeItem('cart');
      setCartItems([]);
      
      // Show success modal
      setOrderId(newOrder.id);
      setSuccessModalOpen(true);
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: "An error occurred while processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const closeSuccessModal = () => {
    setSuccessModalOpen(false);
  };
  
  const goToOrders = () => {
    setSuccessModalOpen(false);
    setLocation("/orders");
  };
  
  const goToHome = () => {
    setSuccessModalOpen(false);
    setLocation("/");
  };

  return (
    <>
      <Helmet>
        <title>Your Cart - MediFind</title>
        <meta name="description" content="Review your selected medications, adjust quantities, and complete your order for pickup at your local pharmacy." />
      </Helmet>
      
      <div className="bg-primary-500 py-6">
        <div className="container-custom">
          <div className="flex items-center">
            <button 
              type="button" 
              className="mr-4 text-white" 
              onClick={handleBackClick}
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </button>
            <h1 className="text-2xl font-heading font-bold text-white">Your Cart</h1>
          </div>
        </div>
      </div>
      
      <div className="container-custom max-w-4xl py-6">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 p-6 text-center">
            <i className="ri-shopping-cart-line text-5xl text-neutral-300 mb-4"></i>
            <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-2">Your Cart is Empty</h2>
            <p className="text-neutral-600 mb-6">Add medications from pharmacies to get started.</p>
            <Button onClick={handleContinueShopping}>
              Browse Pharmacies
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {Object.entries(storeGroups).map(([storeIdStr, items]) => (
                <div key={storeIdStr}>
                  <div className="border-b border-neutral-200 p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-heading font-semibold text-neutral-900">Your Items</h2>
                      <p className="text-neutral-600">From: {storeNames[parseInt(storeIdStr)]}</p>
                    </div>
                  </div>
                  <div className="divide-y divide-neutral-200">
                    {items.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateCartItem}
                        onRemove={removeCartItem}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div className="p-6 bg-neutral-50 border-t border-neutral-200">
                <div className="space-y-4">
                  <div className="flex justify-between text-neutral-700">
                    <p>Subtotal</p>
                    <p>{formatCurrency(subtotal)}</p>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <p>Tax</p>
                    <p>{formatCurrency(tax)}</p>
                  </div>
                  <div className="border-t border-neutral-200 pt-4 flex justify-between font-semibold">
                    <p>Total</p>
                    <p>{formatCurrency(total)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <CheckoutForm
              onSubmit={handleCheckout}
              isLoading={isSubmitting}
            />
            
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={handleContinueShopping}
                variant="outline"
                className="py-6"
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
        
        <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto mb-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                <i className="ri-check-line text-green-500 text-3xl"></i>
              </div>
              <DialogTitle className="text-center">Order Placed Successfully!</DialogTitle>
              <DialogDescription className="text-center">
                Your order has been placed and will be ready for pickup at your selected time.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-neutral-50 p-4 rounded-md mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-neutral-700 font-medium">Order Number:</span>
                <span className="text-neutral-900">#{orderId?.toString().padStart(5, '0')}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-neutral-700 font-medium">Pharmacy:</span>
                <span className="text-neutral-900">{cartItems[0]?.storeName}</span>
              </div>
            </div>
            <div className="space-y-3">
              <Button className="w-full" onClick={goToOrders}>
                View My Orders
              </Button>
              <Button variant="outline" className="w-full" onClick={goToHome}>
                Return to Home
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default CartPage;
