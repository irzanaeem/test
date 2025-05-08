import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

// Types
interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  openingHours: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
}

interface Medication {
  id: number;
  name: string;
  description?: string;
  dosage?: string;
  manufacturer?: string;
  category?: string;
  price: number;
  imageUrl?: string;
  sideEffects?: string;
  usageInstructions?: string;
}

interface StoreInventoryItem {
  id: number;
  storeId: number;
  medicationId: number;
  medication: Medication;
  inStock: boolean;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  userId: number;
  storeId: number;
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
  totalAmount: number;
  createdAt: string;
  pickupTime?: string;
  notes?: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
    address: string;
    city: string;
  };
  items: {
    id: number;
    orderId: number;
    medicationId: number;
    quantity: number;
    price: number;
    medication: Medication;
  }[];
}

// Schema for adding medication to inventory
const addInventorySchema = z.object({
  medicationId: z.string().min(1, "Please select a medication"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  inStock: z.boolean().default(true),
});

// Schema for updating inventory item
const updateInventorySchema = z.object({
  id: z.number(),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  inStock: z.boolean(),
});

// Schema for updating order status
const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "ready", "completed", "cancelled"]),
});

type AddInventoryFormValues = z.infer<typeof addInventorySchema>;
type UpdateInventoryFormValues = z.infer<typeof updateInventorySchema>;
type UpdateOrderStatusFormValues = z.infer<typeof updateOrderStatusSchema>;

const StoreDashboard = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [orderStatusDialogOpen, setOrderStatusDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: stores, isLoading: storesLoading } = useQuery<Store[]>({
    queryKey: ['/api/stores/user'],
    enabled: !!user && user.isStore === true,
  });

  const store = stores && stores.length > 0 ? stores[0] : null;

  const { data: inventory, isLoading: inventoryLoading } = useQuery<StoreInventoryItem[]>({
    queryKey: ['/api/stores', store?.id, 'inventory'],
    enabled: !!store,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/store', store?.id],
    enabled: !!store,
  });

  const { data: allMedications, isLoading: medicationsLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
    enabled: !!user && user.isStore === true,
  });

  // Add inventory mutation
  const addInventoryMutation = useMutation({
    mutationFn: async (data: AddInventoryFormValues) => {
      if (!store) throw new Error("Store not found");
      
      return apiRequest("POST", `/api/stores/${store.id}/inventory`, {
        medicationId: parseInt(data.medicationId),
        quantity: data.quantity,
        price: data.price,
        inStock: data.inStock,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores', store?.id, 'inventory'] });
      setAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Medication added to inventory successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add medication to inventory.",
        variant: "destructive",
      });
    },
  });

  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async (data: UpdateInventoryFormValues) => {
      if (!store) throw new Error("Store not found");
      
      return apiRequest("PATCH", `/api/stores/${store.id}/inventory/${data.id}`, {
        quantity: data.quantity,
        price: data.price,
        inStock: data.inStock,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores', store?.id, 'inventory'] });
      setUpdateDialogOpen(false);
      toast({
        title: "Success",
        description: "Inventory updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory.",
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: "pending" | "confirmed" | "ready" | "completed" | "cancelled" }) => {
      return apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders/store', store?.id] });
      setOrderStatusDialogOpen(false);
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  // Form for adding medication to inventory
  const addInventoryForm = useForm<AddInventoryFormValues>({
    resolver: zodResolver(addInventorySchema),
    defaultValues: {
      medicationId: "",
      quantity: 1,
      price: 0,
      inStock: true,
    },
  });

  // Form for updating inventory
  const updateInventoryForm = useForm<UpdateInventoryFormValues>({
    resolver: zodResolver(updateInventorySchema),
    defaultValues: {
      id: 0,
      quantity: 0,
      price: 0,
      inStock: true,
    },
  });

  // Form for updating order status
  const updateOrderStatusForm = useForm<UpdateOrderStatusFormValues>({
    resolver: zodResolver(updateOrderStatusSchema),
    defaultValues: {
      status: "pending",
    },
  });

  // Effect to reset form when dialog opens
  useEffect(() => {
    if (addDialogOpen) {
      addInventoryForm.reset({
        medicationId: "",
        quantity: 1,
        price: 0,
        inStock: true,
      });
    }
  }, [addDialogOpen, addInventoryForm]);

  // Handle opening update dialog
  const handleOpenUpdateDialog = (item: StoreInventoryItem) => {
    updateInventoryForm.reset({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      inStock: item.inStock,
    });
    setUpdateDialogOpen(true);
  };

  // Handle opening order status dialog
  const handleOpenOrderStatusDialog = (order: Order) => {
    setSelectedOrderId(order.id);
    updateOrderStatusForm.reset({
      status: order.status,
    });
    setOrderStatusDialogOpen(true);
  };

  // Handle add inventory submission
  const onAddInventorySubmit: SubmitHandler<AddInventoryFormValues> = (data) => {
    addInventoryMutation.mutate(data);
  };

  // Handle update inventory submission
  const onUpdateInventorySubmit: SubmitHandler<UpdateInventoryFormValues> = (data) => {
    updateInventoryMutation.mutate(data);
  };

  // Handle update order status submission
  const onUpdateOrderStatusSubmit: SubmitHandler<UpdateOrderStatusFormValues> = (data) => {
    if (selectedOrderId) {
      updateOrderStatusMutation.mutate({
        orderId: selectedOrderId,
        status: data.status,
      });
    }
  };

  // Filter inventory based on search
  const filteredInventory = inventory
    ? inventory.filter(item => 
        item.medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.medication.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.medication.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Get available medications (not already in inventory)
  const availableMedications = allMedications
    ? allMedications.filter(med => 
        !inventory?.some(item => item.medicationId === med.id)
      )
    : [];

  // Filter orders by status if needed
  const pendingOrders = orders
    ? orders.filter(order => ["pending", "confirmed", "ready"].includes(order.status))
    : [];

  const completedOrders = orders
    ? orders.filter(order => ["completed", "cancelled"].includes(order.status))
    : [];

  // Redirect if not a store owner
  if (user && !user.isStore) {
    return (
      <div className="container-custom py-10 text-center">
        <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-4">
          Access Denied
        </h1>
        <p className="text-neutral-600 mb-6">
          This page is only accessible to store owners.
        </p>
        <Button onClick={() => setLocation("/")}>
          Back to Home
        </Button>
      </div>
    );
  }

  // Loading state
  if (storesLoading) {
    return (
      <div className="container-custom py-10">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  // No store created yet
  if (!store) {
    return (
      <div className="container-custom py-10 text-center">
        <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-4">
          No Store Found
        </h1>
        <p className="text-neutral-600 mb-6">
          You don't have a store yet. Please create one to access the dashboard.
        </p>
        <Button onClick={() => setLocation("/store/create")}>
          Create Store
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Store Dashboard - MediFind</title>
        <meta name="description" content="Manage your pharmacy store, inventory, and orders." />
      </Helmet>
      
      <div className="bg-primary-500 py-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-white">Store Dashboard</h1>
              <p className="text-primary-100">{store.name}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                variant="outline" 
                className="bg-white hover:bg-neutral-100 text-primary-600 border-transparent"
                onClick={() => setLocation(`/stores/${store.id}`)}
              >
                View Store Page
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container-custom py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-semibold">Inventory Management</h2>
                <p className="text-neutral-500">Manage your medications and stock</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Input 
                    placeholder="Search medications..." 
                    className="w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Add Medication</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Medication to Inventory</DialogTitle>
                      <DialogDescription>
                        Add a new medication to your store's inventory.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...addInventoryForm}>
                      <form onSubmit={addInventoryForm.handleSubmit(onAddInventorySubmit)} className="space-y-4">
                        <FormField
                          control={addInventoryForm.control}
                          name="medicationId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medication</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a medication" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableMedications.map((med) => (
                                    <SelectItem key={med.id} value={med.id.toString()}>
                                      {med.name} ({med.dosage})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addInventoryForm.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addInventoryForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (PKR)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" min="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addInventoryForm.control}
                          name="inStock"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Available</FormLabel>
                                <FormDescription>
                                  Mark this medication as available in your store
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            disabled={addInventoryMutation.isPending || medicationsLoading}
                          >
                            {addInventoryMutation.isPending ? "Adding..." : "Add to Inventory"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {inventoryLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <div className="bg-neutral-100 mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <i className="ri-medicine-bottle-line text-2xl text-neutral-500"></i>
                </div>
                <h3 className="text-xl font-heading font-medium text-neutral-900 mb-2">No Medications in Inventory</h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? "No medications match your search criteria. Try a different search term." 
                    : "Your inventory is empty. Add medications to get started."}
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded bg-neutral-100 flex items-center justify-center mr-3">
                              {item.medication.imageUrl ? (
                                <img 
                                  src={item.medication.imageUrl} 
                                  alt={item.medication.name} 
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <i className="ri-medicine-bottle-line text-neutral-400"></i>
                              )}
                            </div>
                            <div>
                              <div>{item.medication.name}</div>
                              <div className="text-xs text-neutral-500">{item.medication.dosage}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.medication.category || "—"}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={item.inStock && item.quantity > 0 ? "default" : "destructive"} className={item.inStock && item.quantity > 0 ? "bg-green-500 hover:bg-green-600" : ""}>
                            {item.inStock && item.quantity > 0 ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenUpdateDialog(item)}
                          >
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Update Inventory Dialog */}
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Inventory</DialogTitle>
                  <DialogDescription>
                    Update the inventory details for this medication.
                  </DialogDescription>
                </DialogHeader>
                <Form {...updateInventoryForm}>
                  <form onSubmit={updateInventoryForm.handleSubmit(onUpdateInventorySubmit)} className="space-y-4">
                    <FormField
                      control={updateInventoryForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateInventoryForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (PKR)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateInventoryForm.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Available</FormLabel>
                            <FormDescription>
                              Mark this medication as available in your store
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={updateInventoryMutation.isPending}
                      >
                        {updateInventoryMutation.isPending ? "Updating..." : "Update Inventory"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-8">
              {/* Active Orders */}
              <div>
                <h2 className="text-xl font-heading font-semibold mb-4">Active Orders</h2>
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : pendingOrders.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <div className="bg-neutral-100 mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
                      <i className="ri-shopping-bag-line text-2xl text-neutral-500"></i>
                    </div>
                    <h3 className="text-xl font-heading font-medium text-neutral-900 mb-2">No Active Orders</h3>
                    <p className="text-neutral-600 max-w-md mx-auto">
                      You don't have any active orders at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {pendingOrders.map((order) => (
                      <Card key={order.id}>
                        <CardHeader className="pb-4">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                            <div>
                              <CardTitle className="flex items-center">
                                Order #{order.id}
                                <Badge className="ml-3" variant={
                                  order.status === "pending" ? "default" :
                                  order.status === "confirmed" ? "secondary" :
                                  order.status === "ready" ? "outline" :
                                  "default"
                                }>
                                  {order.status === "pending" ? "Pending" :
                                   order.status === "confirmed" ? "Confirmed" :
                                   order.status === "ready" ? "Ready for Pickup" :
                                   order.status}
                                </Badge>
                              </CardTitle>
                              <CardDescription>
                                {new Date(order.createdAt).toLocaleDateString()} • 
                                {order.pickupTime ? ` Pickup: ${order.pickupTime}` : ' No pickup time specified'}
                              </CardDescription>
                            </div>
                            <div className="mt-4 md:mt-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenOrderStatusDialog(order)}
                              >
                                Update Status
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Customer Information</h4>
                              <div className="text-sm text-neutral-600">
                                <p>{order.user.firstName} {order.user.lastName}</p>
                                <p>{order.user.phone || "No phone provided"}</p>
                                <p>{order.user.address}, {order.user.city}</p>
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <h4 className="text-sm font-medium mb-2">Order Items</h4>
                              <ul className="space-y-2 text-sm">
                                {order.items.map((item) => (
                                  <li key={item.id} className="flex justify-between">
                                    <span>{item.quantity}x {item.medication.name} ({item.medication.dosage})</span>
                                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4 flex justify-between">
                          <div>
                            {order.notes && (
                              <p className="text-sm text-neutral-600">
                                <span className="font-medium">Notes:</span> {order.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-lg font-bold">
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed/Cancelled Orders */}
              <div>
                <h2 className="text-xl font-heading font-semibold mb-4">Order History</h2>
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : completedOrders.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <h3 className="text-xl font-heading font-medium text-neutral-900 mb-2">No Order History</h3>
                    <p className="text-neutral-600 max-w-md mx-auto">
                      You don't have any completed or cancelled orders yet.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{order.user.firstName} {order.user.lastName}</TableCell>
                            <TableCell>{order.items.length} items</TableCell>
                            <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={order.status === "completed" ? "default" : "destructive"} 
                                className={order.status === "completed" ? "bg-green-500 hover:bg-green-600" : ""}>
                                {order.status === "completed" ? "Completed" : "Cancelled"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            {/* Update Order Status Dialog */}
            <Dialog open={orderStatusDialogOpen} onOpenChange={setOrderStatusDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Order Status</DialogTitle>
                  <DialogDescription>
                    Change the status of this order to track its progress.
                  </DialogDescription>
                </DialogHeader>
                <Form {...updateOrderStatusForm}>
                  <form onSubmit={updateOrderStatusForm.handleSubmit(onUpdateOrderStatusSubmit)} className="space-y-4">
                    <FormField
                      control={updateOrderStatusForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="ready">Ready for Pickup</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={updateOrderStatusMutation.isPending}
                      >
                        {updateOrderStatusMutation.isPending ? "Updating..." : "Update Status"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default StoreDashboard;