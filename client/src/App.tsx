import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Stores from "@/pages/stores";
import StoreDetail from "@/pages/store-detail";
import MedicationDetail from "@/pages/medication-detail";
import Cart from "@/pages/cart";
import Scanner from "@/pages/scanner";
import Orders from "@/pages/orders";
import Notifications from "@/pages/notifications";

function Router() {
  const [location] = useLocation();
  
  const isAuthPage = 
    location === "/login" || 
    location === "/signup";
  
  return (
    <>
      {!isAuthPage && <Navbar />}
      
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/stores" component={Stores} />
        <Route path="/stores/:id" component={StoreDetail} />
        <Route path="/medications/:id" component={MedicationDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/scanner" component={Scanner} />
        <Route path="/orders" component={Orders} />
        <Route path="/notifications" component={Notifications} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
