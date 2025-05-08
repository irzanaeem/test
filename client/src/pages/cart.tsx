import { useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MinusIcon, PlusIcon, ShoppingCart, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CheckoutFormData {
  fullName: string;
  phone: string;
  pickupTime: string;
  paymentMethod: string;
  notes: string;
}

const CartPage = () => {
  const { toast } = useToast();
  // Use the setLocation function for navigation
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalAmount, hasItems } = useCart();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: user ? `${user.firstName} ${user.lastName}` : "",
    phone: user?.phone || "",
    pickupTime: "",
    paymentMethod: "cash",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Group items by store
  const itemsByStore = items.reduce((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeName: item.storeName,
        items: [],
        total: 0
      };
    }
    acc[item.storeId].items.push(item);
    acc[item.storeId].total += item.price * item.quantity;
    return acc;
  }, {} as Record<number, { storeName: string; items: typeof items; total: number }>);

  const checkoutMutation = useMutation({
    mutationFn: async (storeId: number) => {
      const storeItems = itemsByStore[storeId].items;
      
      const orderData = {
        storeId: Number(storeId),
        totalAmount: Number(itemsByStore[storeId].total.toFixed(2)),
        pickupTime: formData.pickupTime,
        notes: formData.notes || ""
      };
      
      const response = await apiRequest("POST", "/api/orders", {
        order: orderData,
        items: storeItems.map(item => ({
          medicationId: Number(item.medicationId),
          quantity: Number(item.quantity),
          price: Number(item.price.toFixed(2))
        }))
      });
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order placed successfully",
        description: `Your order #${data.id} has been placed and the pharmacy has been notified.`,
      });
      
      // Remove ordered items from cart
      items.forEach(item => {
        if (item.storeId === data.storeId) {
          removeItem(item.medicationId);
        }
      });
      
      // Refresh notifications and orders
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      // Redirect to orders page
      setLocation("/orders");
    },
    onError: (error: Error) => {
      toast({
        title: "Order failed",
        description: error.message || "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCheckout = async (storeId: number) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to place an order.",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    
    if (!formData.pickupTime) {
      toast({
        title: "Pickup time required",
        description: "Please select when you'd like to pick up your order.",
        variant: "destructive",
      });
      return;
    }
    
    checkoutMutation.mutate(storeId);
  };

  // Generate time slots for today and tomorrow
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const today = new Date().toLocaleDateString();
    const tomorrow = new Date(now.setDate(now.getDate() + 1)).toLocaleDateString();
    
    // Generate time slots from 9 AM to 6 PM
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${hour}:00`;
      slots.push(`${today} ${time}`);
      slots.push(`${tomorrow} ${time}`);
    }
    
    return slots;
  };

  if (!hasItems) {
    return (
      <>
        <Helmet>
          <title>Your Cart - E Pharma</title>
          <meta 
            name="description" 
            content="View and manage items in your cart at E Pharma, your online medication delivery service."
          />
        </Helmet>
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="mb-4">
              <ShoppingCart className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some medications to your cart to get started.</p>
            <Button onClick={() => setLocation("/")}>Browse Medications</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Your Cart - E Pharma</title>
        <meta 
          name="description" 
          content="View and manage items in your cart at E Pharma, your online medication delivery service."
        />
      </Helmet>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Your Cart ({totalItems} items)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {Object.entries(itemsByStore).map(([storeId, { storeName, items, total }]) => (
              <Card key={storeId} className="mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{storeName}</h2>
                    <span className="text-gray-600 text-sm">
                      Store subtotal: {formatCurrency(total)}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-md bg-gray-50">
                        <div className="flex items-center gap-3 mb-3 sm:mb-0">
                          <div className="h-16 w-16 rounded-md bg-white flex items-center justify-center border overflow-hidden">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                <i className="ri-medicine-bottle-line text-2xl text-gray-400"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.dosage}</p>
                            <p className="text-sm font-medium">{formatCurrency(item.price)} each</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="flex items-center justify-between border rounded-md">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-gray-600"
                              onClick={() => updateQuantity(item.medicationId, item.quantity - 1)}
                            >
                              <MinusIcon className="h-4 w-4" />
                            </Button>
                            
                            <div className="w-8 text-center">{item.quantity}</div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-gray-600"
                              onClick={() => updateQuantity(item.medicationId, item.quantity + 1)}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => removeItem(item.medicationId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          <span className="font-medium ml-3">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Pickup Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`fullName-${storeId}`}>Full Name</Label>
                        <Input
                          id={`fullName-${storeId}`}
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`phone-${storeId}`}>Phone Number</Label>
                        <Input
                          id={`phone-${storeId}`}
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Your phone number"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`pickupTime-${storeId}`}>Pickup Time</Label>
                        <Select
                          value={formData.pickupTime}
                          onValueChange={(value) => handleSelectChange("pickupTime", value)}
                        >
                          <SelectTrigger id={`pickupTime-${storeId}`}>
                            <SelectValue placeholder="Select pickup time" />
                          </SelectTrigger>
                          <SelectContent>
                            {generateTimeSlots().map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`paymentMethod-${storeId}`}>Payment Method</Label>
                        <Select
                          value={formData.paymentMethod}
                          onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                        >
                          <SelectTrigger id={`paymentMethod-${storeId}`}>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash on Pickup</SelectItem>
                            <SelectItem value="card">Card on Pickup</SelectItem>
                            <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                            <SelectItem value="jazzcash">JazzCash</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <Label htmlFor={`notes-${storeId}`}>Additional Notes</Label>
                      <Textarea
                        id={`notes-${storeId}`}
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any special instructions for your order"
                        className="resize-none"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="default"
                        className="mt-4"
                        onClick={() => handleCheckout(Number(storeId))}
                        disabled={checkoutMutation.isPending}
                      >
                        {checkoutMutation.isPending ? "Processing..." : "Place Order"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>Free</span>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation("/")}
                  >
                    Continue Shopping
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full mt-3 text-red-500"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;