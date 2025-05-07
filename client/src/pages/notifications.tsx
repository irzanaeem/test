import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NotificationItem from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  relatedOrderId?: number;
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch notifications
  const { data: notifications, isLoading, error } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });
  
  // Mutation to mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });
  
  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });
    }
  });
  
  const handleBackClick = () => {
    setLocation("/");
  };
  
  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  if (!user) {
    return (
      <div className="container-custom py-10 text-center">
        <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-4">
          Login Required
        </h1>
        <p className="text-neutral-600 mb-6">
          Please login to view your notifications.
        </p>
        <Button onClick={() => setLocation("/login")}>
          Sign In
        </Button>
      </div>
    );
  }

  // Sort notifications by date (newest first)
  const sortedNotifications = notifications 
    ? [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  return (
    <>
      <Helmet>
        <title>Notifications - MediFind</title>
        <meta name="description" content="View your medication order updates, prescription reminders, and other important notifications from pharmacies." />
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
            <h1 className="text-2xl font-heading font-bold text-white">Notifications</h1>
          </div>
        </div>
      </div>
      
      <div className="container-custom max-w-3xl py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold text-neutral-900">Recent Notifications</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending || !notifications || notifications.every(n => n.read)}
            >
              Mark all as read
            </Button>
          </div>
          
          <div className="divide-y divide-neutral-200">
            {isLoading ? (
              <>
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="p-4">
                    <div className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <Skeleton className="h-5 w-4/5 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex justify-between items-center mt-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-500">Error loading notifications. Please try again later.</p>
              </div>
            ) : sortedNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <i className="ri-notification-line text-4xl text-neutral-300 mb-3"></i>
                <h3 className="text-lg font-heading font-medium text-neutral-700 mb-1">No Notifications</h3>
                <p className="text-neutral-500">You don't have any notifications yet.</p>
              </div>
            ) : (
              sortedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
