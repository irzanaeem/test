import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [hasNotifications, setHasNotifications] = useState(false);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  
  // Fetch notifications to check for unread notifications
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });
  
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const unreadNotifications = notifications.filter((notification) => !notification.read);
      setHasNotifications(unreadNotifications.length > 0);
    }
  }, [notifications]);
  
  // Get cart items from localStorage
  useEffect(() => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      const cartItems = JSON.parse(cart);
      const itemCount = cartItems.reduce((count: number, item: any) => count + item.quantity, 0);
      setCartCount(itemCount);
    }
  }, [location]);
  
  // Handle clicking outside cart dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        // Close cart dropdown if needed
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow text-primary-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <i className="ri-medicine-bottle-line text-2xl text-primary-600"></i>
              <span className="text-xl font-bold text-primary-700">E Pharma</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>Home</Link>
            <Link to="/stores" className={`nav-link${isActive('/stores') ? ' active' : ''}`}>Pharmacies</Link>
            <Link to="/prescription" className={`nav-link${isActive('/prescription') ? ' active' : ''}`}>OCR Prescription Reader</Link>
            {user && (
              <Link to="/orders" className={`nav-link${isActive('/orders') ? ' active' : ''}`}>Orders</Link>
            )}
            {user?.isStore && (
              <>
                <Link to="/store-dashboard" className={`nav-link${isActive('/store-dashboard') ? ' active' : ''}`}>My Pharmacy</Link>
                <Link to="/create-pharmacy" className={`nav-link${isActive('/create-pharmacy') ? ' active' : ''}`}>Create Pharmacy</Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" className="text-primary-700 hover:bg-primary-50" onClick={handleLogout}>
                  Logout
                </Button>
                <Link to="/profile">
                  <Button className="modern-btn-outline" type="button">Profile</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="ghost" className="text-primary-700 hover:bg-primary-50">
                    Login
                  </Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button variant="outline" className="border-primary-700 text-primary-700 hover:bg-primary-50">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-background border-t border-border`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            href="/"
            className={`${isActive('/') ? 'bg-primary-900 border-l-4 border-primary-400 text-primary-400' : 'border-l-4 border-transparent text-foreground hover:bg-background/80 hover:border-border hover:text-primary-400'} block pl-3 pr-4 py-2 font-medium transition-colors`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/stores"
            className={`${isActive('/stores') ? 'bg-primary-900 border-l-4 border-primary-400 text-primary-400' : 'border-l-4 border-transparent text-foreground hover:bg-background/80 hover:border-border hover:text-primary-400'} block pl-3 pr-4 py-2 font-medium transition-colors`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Stores
          </Link>
          <Link 
            href="/scanner"
            className={`${isActive('/scanner') ? 'bg-primary-900 border-l-4 border-primary-400 text-primary-400' : 'border-l-4 border-transparent text-foreground hover:bg-background/80 hover:border-border hover:text-primary-400'} block pl-3 pr-4 py-2 font-medium transition-colors`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Scanner
          </Link>
          <Link 
            href="/orders"
            className={`${isActive('/orders') ? 'bg-primary-900 border-l-4 border-primary-400 text-primary-400' : 'border-l-4 border-transparent text-foreground hover:bg-background/80 hover:border-border hover:text-primary-400'} block pl-3 pr-4 py-2 font-medium transition-colors`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Orders
          </Link>
          
          {user?.isStore && (
            <>
              <div className="border-t border-border my-2"></div>
              <div className="pt-1 pb-1">
                <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Pharmacy Manager
                </h3>
              </div>
              <Link 
                href="/store-dashboard"
                className={`${isActive('/store-dashboard') ? 'bg-primary-900 border-l-4 border-primary-400 text-primary-400' : 'border-l-4 border-transparent text-foreground hover:bg-background/80 hover:border-border hover:text-primary-400'} block pl-3 pr-4 py-2 font-medium transition-colors`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <i className="ri-store-3-line mr-2"></i>
                  My Pharmacy
                </span>
              </Link>
              <Link 
                href="/create-pharmacy"
                className={`${isActive('/create-pharmacy') ? 'bg-primary-900 border-l-4 border-primary-400 text-primary-400' : 'border-l-4 border-transparent text-foreground hover:bg-background/80 hover:border-border hover:text-primary-400'} block pl-3 pr-4 py-2 font-medium transition-colors`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <i className="ri-add-line mr-2"></i>
                  Create Pharmacy
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;