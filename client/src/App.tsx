import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { ProtectedRoute } from "@/lib/protected-route";
import Navbar from "@/components/layout/navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import Stores from "@/pages/stores";
import StoreDetail from "@/pages/store-detail";
import MedicationDetail from "@/pages/medication-detail";
import Cart from "@/pages/cart";
import Scanner from "@/pages/scanner";
import Orders from "@/pages/orders";
import Notifications from "@/pages/notifications";
import CreatePharmacy from "@/pages/create-pharmacy";
import StoreDashboard from "@/pages/store-dashboard";

function Router() {
  const [location] = useLocation();
  
  const isAuthPage = location === "/auth";
  
  return (
    <>
      {!isAuthPage && <Navbar />}
      
      <Switch>
        <ProtectedRoute path="/" component={Home} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/stores" component={Stores} />
        <ProtectedRoute path="/stores/:id" component={StoreDetail} />
        <ProtectedRoute path="/medications/:id" component={MedicationDetail} />
        <ProtectedRoute path="/cart" component={Cart} />
        <ProtectedRoute path="/scanner" component={Scanner} />
        <ProtectedRoute path="/orders" component={Orders} />
        <ProtectedRoute path="/notifications" component={Notifications} />
        <ProtectedRoute path="/create-pharmacy" component={CreatePharmacy} />
        <ProtectedRoute path="/store-dashboard" component={StoreDashboard} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
