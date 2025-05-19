import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  openingHours: string;
  description: string;
  imageUrl?: string;
}

interface Medication {
  id: number;
  name: string;
  description: string;
  dosage: string;
  manufacturer?: string;
  category?: string;
  price: number;
  imageUrl?: string;
}

interface StoreInventory {
  id: number;
  medicationId: number;
  storeId: number;
  price: number;
  quantity: number;
  inStock: boolean;
  medication: Medication;
}

interface Order {
  id: number;
  status: string;
  createdAt: string;
  pickupTime: string;
  totalAmount: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  items: {
    id: number;
    medicationId: number;
    quantity: number;
    price: number;
    medication: {
      id: number;
      name: string;
      dosage: string;
    };
  }[];
}

interface InventoryFormData {
  medicationId: number;
  price: number;
  quantity: number;
  productName?: string;
  imageUrl?: string;
}

const StoreDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [inventoryFormData, setInventoryFormData] = useState<InventoryFormData>({
    medicationId: 0,
    price: 0,
    quantity: 0,
  });
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentInventoryId, setCurrentInventoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user's stores
  const { data: stores = [], isLoading: isLoadingStores } = useQuery<Store[]>({
    queryKey: ["/api/stores/user"],
    enabled: !!user?.isStore,
  });

  // Fetch all medications for the inventory management
  const { data: medications = [], isLoading: isLoadingMedications } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
    enabled: !!selectedStore,
  });

  // Fetch store inventory
  const { data: inventory = [], isLoading: isLoadingInventory } = useQuery<StoreInventory[]>({
    queryKey: ["/api/stores", selectedStore?.id, "inventory"],
    enabled: !!selectedStore,
  });

  // Fetch store orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: [`/api/orders/store/${selectedStore?.id}`],
    enabled: !!selectedStore,
  });

  // Set the first store as selected on initial load
  useEffect(() => {
    if (stores && stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0]);
    }
  }, [stores, selectedStore]);

  // Add/Update inventory item mutation
  const inventoryMutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      const endpoint = isEditMode 
        ? `/api/stores/${selectedStore?.id}/inventory/${currentInventoryId}` 
        : `/api/stores/${selectedStore?.id}/inventory`;
      
      const method = isEditMode ? "PATCH" : "POST";
      
      const response = await apiRequest(method, endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: isEditMode ? "Inventory Updated" : "Product Added",
        description: isEditMode 
          ? "The inventory item has been updated successfully." 
          : "The product has been added to your inventory.",
        variant: "default",
      });
      
      // Invalidate and refetch inventory data
      queryClient.invalidateQueries({ queryKey: ["/api/stores", selectedStore?.id, "inventory"] });
      queryClient.refetchQueries({ queryKey: ["/api/stores", selectedStore?.id, "inventory"] });
      
      // Reset form and close dialog
      setInventoryFormData({ medicationId: 0, price: 0, quantity: 0 });
      setInventoryDialogOpen(false);
      setIsEditMode(false);
      setCurrentInventoryId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "add"} inventory: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "The order status has been updated successfully.",
        variant: "default",
      });
      
      // Invalidate and refetch orders data
      queryClient.invalidateQueries({ queryKey: [`/api/orders/store/${selectedStore?.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update order status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update handleInventorySubmit to support new medication creation with image upload
  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let medicationId = inventoryFormData.medicationId;
    let medicationImageUrl = inventoryFormData.imageUrl;
    // If productName is provided and does not match an existing medication, create it
    if (inventoryFormData.productName) {
      const existing = medications.find(m => m.name.toLowerCase() === inventoryFormData.productName!.toLowerCase());
      if (!existing) {
        // Create new medication
        let formData = new FormData();
        formData.append("name", inventoryFormData.productName);
        formData.append("price", String(inventoryFormData.price));
        if (selectedImageFile) {
          formData.append("image", selectedImageFile);
        }
        // Add other fields as needed
        const res = await fetch("/api/medications", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          // Handle error
          toast({ title: "Error", description: "Failed to create medication.", variant: "destructive" });
          return;
        }
        const newMed = await res.json();
        medicationId = newMed.id;
        medicationImageUrl = newMed.imageUrl;
      } else {
        medicationId = existing.id;
        medicationImageUrl = existing.imageUrl;
      }
    }
    // Now add to inventory
    medicationId = Number(medicationId);
    if (!medicationId || isNaN(medicationId)) {
      toast({ title: "Error", description: "Invalid medication ID.", variant: "destructive" });
      return;
    }
    inventoryMutation.mutate({
      medicationId,
      price: inventoryFormData.price,
      quantity: inventoryFormData.quantity,
      imageUrl: medicationImageUrl,
    });
  };

  // Handle order status change
  const handleOrderStatusChange = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // Function to open edit inventory dialog
  const openEditInventoryDialog = (item: StoreInventory) => {
    setInventoryFormData({
      medicationId: item.medicationId,
      price: item.price,
      quantity: item.quantity,
    });
    setCurrentInventoryId(item.id);
    setIsEditMode(true);
    setInventoryDialogOpen(true);
  };

  // Function to open add new inventory dialog
  const openAddInventoryDialog = () => {
    setInventoryFormData({ medicationId: 0, price: 0, quantity: 0 });
    setIsEditMode(false);
    setCurrentInventoryId(null);
    setInventoryDialogOpen(true);
  };

  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'in-stock' | 'out-of-stock' | 'low-stock'>('all');

  const filteredInventory = inventory.filter(item => {
    // Apply text search filter
    const matchesSearch = 
      item.medication &&
      (
        (item.medication.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (item.medication.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      );
    // Apply status filter
    const matchesFilter = 
      inventoryFilter === 'all' ||
      (inventoryFilter === 'in-stock' && item.inStock && item.quantity > 10) ||
      (inventoryFilter === 'low-stock' && item.inStock && item.quantity > 0 && item.quantity <= 10) ||
      (inventoryFilter === 'out-of-stock' && (!item.inStock || item.quantity === 0));
    return matchesSearch && matchesFilter;
  });

  const pendingOrders = orders.filter(order => order.status === "pending");
  const processingOrders = orders.filter(order => order.status === "processing");
  const readyForPickupOrders = orders.filter(order => order.status === "ready");
  const completedOrders = orders.filter(order => order.status === "completed");
  const cancelledOrders = orders.filter(order => order.status === "cancelled");

  // Redirect if user is not a store owner
  if (!user?.isStore) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-semibold mb-4">Not Authorized</h1>
        <p>You must be registered as a pharmacy store owner to access this page.</p>
        <Button 
          onClick={() => navigate("/")}
          className="mt-4"
        >
          Go to Home Page
        </Button>
      </div>
    );
  }

  if (isLoadingStores) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading your pharmacy information...</p>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-2xl mx-auto bg-card p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold mb-4">No Pharmacy Found</h1>
          <p className="mb-6">You don't have any pharmacy registered yet. Create your first pharmacy to manage your business on E Pharma.</p>
          <Button 
            onClick={() => navigate("/create-pharmacy")}
            className="shadow-md border border-primary-600"
          >
            Create Your Pharmacy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{selectedStore?.name ? `${selectedStore.name} Dashboard` : "Pharmacy Dashboard"} - E Pharma</title>
        <meta 
          name="description" 
          content="Manage your pharmacy store, inventory, and orders with E Pharma's pharmacy dashboard."
        />
      </Helmet>

      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your pharmacy, inventory, and orders</p>
          </div>

          {stores.length > 1 && (
            <div className="mt-4 md:mt-0">
              <Select
                value={selectedStore?.id.toString() || ""}
                onValueChange={(value) => {
                  const store = stores.find(s => s.id.toString() === value);
                  if (store) setSelectedStore(store);
                }}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select pharmacy" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name} ({store.city})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {selectedStore && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="flex justify-center">
                <Card className="bg-white text-black">
                  <CardHeader>
                    <CardTitle className="text-black">Store Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-black">Name:</span>
                      <span className="text-black">{selectedStore.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-black">Address:</span>
                      <span className="text-black">{selectedStore.address}, {selectedStore.city}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-black">Contact:</span>
                      <span className="text-black">{selectedStore.phone}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setActiveTab("settings")}
                    >
                      Edit Store Information
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="inventory">
              <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Inventory Management</h2>
                    <p className="text-gray-600 text-sm">Manage your store's products, prices, and stock levels</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  {isLoadingInventory ? (
                    <div className="p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p>Loading inventory...</p>
                    </div>
                  ) : filteredInventory.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500 mb-4">No products found in your inventory.</p>
                      <Button onClick={openAddInventoryDialog}>
                        Add product
                      </Button>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredInventory.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  {item.medication.imageUrl ? (
                                    <img 
                                      src={item.medication.imageUrl} 
                                      alt={item.medication.name} 
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <i className="ri-capsule-line text-gray-500"></i>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{item.medication.name}</div>
                                  <div className="text-sm text-gray-500">{item.medication.dosage}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.medication.category || "General"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.inStock && item.quantity > 0 ? (
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                  In Stock
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                  Out of Stock
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openEditInventoryDialog(item)}
                              >
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold">Order Management</h2>
                  <p className="text-gray-600 text-sm">View and manage orders from your customers</p>
                </div>

                <div className="overflow-x-auto">
                  {isLoadingOrders ? (
                    <div className="p-8 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p>Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No orders found for your pharmacy yet.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pickup Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.user.firstName} {order.user.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.pickupTime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(order.totalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl bg-white text-black">
                                  <DialogHeader>
                                    <DialogTitle>Order #{order.id} Details</DialogTitle>
                                    <DialogDescription>
                                      Placed on {formatDate(order.createdAt)}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h4>
                                      <p><span className="font-medium">Name:</span> {order.user.firstName} {order.user.lastName}</p>
                                      <p><span className="font-medium">Phone:</span> {order.user.phone || "Not provided"}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-500 mb-2">Order Information</h4>
                                      <p><span className="font-medium">Status:</span> <StatusBadge status={order.status} /></p>
                                      <p><span className="font-medium">Pickup Time:</span> {formatDate(order.pickupTime)}</p>
                                      <p><span className="font-medium">Total Amount:</span> {formatCurrency(order.totalAmount)}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  <div className="my-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
                                    <div className="overflow-x-auto">
                                      <table className="w-full">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Product
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Quantity
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Price
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Total
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {order.items.map((item) => (
                                            <tr key={item.id}>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {item.medication.name} ({item.medication.dosage})
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                {item.quantity}
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(item.price)}
                                              </td>
                                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                                {formatCurrency(item.price * item.quantity)}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                        <tfoot>
                                          <tr>
                                            <td colSpan={3} className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                              Total:
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                              {formatCurrency(order.totalAmount)}
                                            </td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                  </div>

                                  <Separator />

                                  <div className="mt-4">
                                    <Label htmlFor="status">Update Status</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Select
                                        defaultValue={order.status}
                                        onValueChange={(value) => handleOrderStatusChange(order.id, value)}
                                        disabled={updateOrderStatusMutation.isPending}
                                      >
                                        <SelectTrigger className="w-[200px] bg-white text-black">
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="processing">Processing</SelectItem>
                                          <SelectItem value="ready">Ready for Pickup</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button className="bg-white text-black border border-gray-300 hover:bg-gray-100" disabled={updateOrderStatusMutation.isPending}>
                                        {updateOrderStatusMutation.isPending ? "Updating..." : "Update"}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="bg-white text-black rounded-lg shadow-md overflow-hidden p-6">
                <h2 className="text-xl font-semibold mb-4">Store Settings</h2>
                <p className="text-gray-600 text-sm mb-6">Update your pharmacy's information and settings</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Pharmacy Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="storeName">Pharmacy Name</Label>
                        <Input 
                          id="storeName" 
                          value={selectedStore.name} 
                          disabled
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="storeAddress">Address</Label>
                        <Input 
                          id="storeAddress" 
                          value={selectedStore.address} 
                          disabled
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="storeCity">City</Label>
                        <Input 
                          id="storeCity" 
                          value={selectedStore.city} 
                          disabled
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="storeZipCode">Zip Code</Label>
                        <Input 
                          id="storeZipCode" 
                          value={selectedStore.zipCode} 
                          disabled
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="storePhone">Phone Number</Label>
                        <Input 
                          id="storePhone" 
                          value={selectedStore.phone} 
                          disabled
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="storeEmail">Email Address</Label>
                        <Input 
                          id="storeEmail" 
                          value={selectedStore.email} 
                          disabled
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="storeHours">Opening Hours</Label>
                        <Input 
                          id="storeHours" 
                          value={selectedStore.openingHours} 
                          disabled
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-4">
                  <Button variant="outline" className="bg-white text-black border border-gray-300 hover:bg-gray-100" onClick={() => navigate(`/stores/${selectedStore.id}`)}>
                    View Public Profile
                  </Button>
                  <Button className="bg-primary-500" disabled>
                    Edit Information
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Add/Edit Inventory Dialog */}
      <Dialog open={inventoryDialogOpen} onOpenChange={setInventoryDialogOpen}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Inventory Item" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the product's price and stock quantity." 
                : "Add a new product to your pharmacy's inventory."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInventorySubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="medicationId">Product</Label>
                {isEditMode ? (
                  <Input 
                    id="medicationId"
                    value={medications.find(m => m.id === inventoryFormData.medicationId)?.name || ""}
                    disabled
                  />
                ) : (
                  <Input
                    id="productName"
                    placeholder="Enter product name"
                    value={inventoryFormData.productName || ''}
                    onChange={e => setInventoryFormData({ ...inventoryFormData, productName: e.target.value })}
                    required
                    className="bg-white text-black border-gray-300"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rs)</Label>
                <Input 
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inventoryFormData.price}
                  onChange={(e) => setInventoryFormData({ 
                    ...inventoryFormData, 
                    price: parseFloat(e.target.value) 
                  })}
                  required
                  className="bg-white text-black border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity in Stock</Label>
                <Input 
                  id="quantity"
                  type="number"
                  min="0"
                  value={inventoryFormData.quantity}
                  onChange={(e) => setInventoryFormData({ 
                    ...inventoryFormData, 
                    quantity: parseInt(e.target.value) 
                  })}
                  required
                  className="bg-white text-black border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setInventoryFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
                      setSelectedImageFile(file);
                    }
                  }}
                  className="bg-white text-black border-gray-300"
                />
                {selectedImageFile && (
                  <img src={URL.createObjectURL(selectedImageFile)} alt="Preview" className="w-24 h-24 object-cover mt-2 rounded" />
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setInventoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={inventoryMutation.isPending || (isEditMode && !inventoryFormData.medicationId)}
              >
                {inventoryMutation.isPending ? "Saving..." : isEditMode ? "Save Changes" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper component for rendering order status badges
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
          Pending
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
          Processing
        </Badge>
      );
    case "ready":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          Ready for Pickup
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          Completed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
          {status}
        </Badge>
      );
  }
};

export default StoreDashboard;