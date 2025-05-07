import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import OrderCard from "@/components/orders/order-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface OrderMedication {
  id: number;
  name: string;
  dosage: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
}

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  pickupTime: string;
  store: Store;
  items: OrderMedication[];
}

const OrdersPage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch orders
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });
  
  // Filter orders by status
  const filteredOrders = orders ? 
    statusFilter === "all" 
      ? orders 
      : orders.filter(order => order.status.toLowerCase() === statusFilter.toLowerCase())
    : [];
  
  // Sort by most recent first
  const sortedOrders = [...(filteredOrders || [])].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  if (!user) {
    return (
      <div className="container-custom py-10 text-center">
        <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-4">
          Login Required
        </h1>
        <p className="text-neutral-600 mb-6">
          Please login to view your orders.
        </p>
        <Button onClick={() => setLocation("/login")}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Your Orders - MediFind</title>
        <meta name="description" content="View your medication orders, track status, and see details about your past and upcoming pickups from local pharmacies." />
      </Helmet>
      
      <div className="bg-primary-500 py-6">
        <div className="container-custom">
          <h1 className="text-2xl font-heading font-bold text-white">Your Orders</h1>
        </div>
      </div>
      
      <div className="container-custom max-w-4xl py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-neutral-900">Recent Orders</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-700">Filter:</span>
              <Select defaultValue="all" onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All orders</SelectItem>
                  <SelectItem value="pending">Processing</SelectItem>
                  <SelectItem value="ready">Ready for pickup</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24 mt-2 sm:mt-0" />
                  </div>
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-60 mb-2" />
                        <Skeleton className="h-4 w-48 mt-2" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-5 w-20 mb-2" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading orders. Please try again later.</p>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 text-center">
            <i className="ri-shopping-bag-line text-5xl text-neutral-300 mb-4"></i>
            <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-2">No Orders Found</h2>
            <p className="text-neutral-600 mb-6">You don't have any orders yet.</p>
            <Button onClick={() => setLocation("/stores")}>
              Browse Pharmacies
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;
