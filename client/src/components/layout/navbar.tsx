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

  return (
    <nav className="sticky top-0 bg-white border-b border-neutral-200 shadow-sm z-50">
      <div className="container-custom">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <i className="ri-capsule-fill text-primary-500 text-2xl mr-2"></i>
              <span className="font-heading font-bold text-primary-500 text-xl">E Pharma</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link 
                href="/" 
                className={`${isActive('/') ? 'text-primary-500 border-primary-500 border-b-2' : 'text-neutral-500 hover:text-primary-500'} px-1 pt-1 font-medium`}
              >
                Home
              </Link>
              <Link 
                href="/stores" 
                className={`${isActive('/stores') ? 'text-primary-500 border-primary-500 border-b-2' : 'text-neutral-500 hover:text-primary-500'} px-1 pt-1 font-medium`}
              >
                Stores
              </Link>
              <Link 
                href="/scanner" 
                className={`${isActive('/scanner') ? 'text-primary-500 border-primary-500 border-b-2' : 'text-neutral-500 hover:text-primary-500'} px-1 pt-1 font-medium`}
              >
                Scanner
              </Link>
              <Link 
                href="/orders" 
                className={`${isActive('/orders') ? 'text-primary-500 border-primary-500 border-b-2' : 'text-neutral-500 hover:text-primary-500'} px-1 pt-1 font-medium`}
              >
                Orders
              </Link>
            </div>
            
            <div className="flex items-center ml-4 md:ml-6">
              <Link href="/cart" className="p-1 rounded-full text-neutral-500 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 relative">
                <span className="sr-only">View shopping cart</span>
                <i className="ri-shopping-cart-2-line text-xl"></i>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-accent-500 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="ml-4 flex items-center space-x-2">
                  <button 
                    onClick={() => logout()} 
                    className="text-sm font-medium text-red-500 hover:text-red-600 px-3 py-1 border border-red-500 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                  
                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500">
                          <span className="sr-only">Open user menu</span>
                          <div className="relative">
                            <span className="bg-primary-500 h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {getInitials(user.firstName, user.lastName)}
                            </span>
                            {hasNotifications && (
                              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                            )}
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-4 py-3">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-neutral-500 truncate mt-1">
                            {user.email}
                          </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="cursor-pointer w-full">
                            Your Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/notifications" className="cursor-pointer w-full flex items-center justify-between">
                            <span>Notifications</span>
                            {hasNotifications && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">New</span>
                            )}
                          </Link>
                        </DropdownMenuItem>
                        
                        {user.isStore && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href="/store-dashboard" className="cursor-pointer w-full">
                                <span className="flex items-center">
                                  <i className="ri-store-3-line mr-2"></i>
                                  My Pharmacy
                                </span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/create-pharmacy" className="cursor-pointer w-full">
                                <span className="flex items-center">
                                  <i className="ri-add-circle-line mr-2"></i>
                                  Create Pharmacy
                                </span>
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ) : (
                <div className="ml-4 flex items-center space-x-3">
                  <Link href="/login" className="text-sm font-medium text-primary-500 hover:text-primary-600">
                    Log in
                  </Link>
                  <Link href="/signup" className="text-sm font-medium text-white bg-primary-500 px-3 py-2 rounded-md hover:bg-primary-600 transition-colors">
                    Sign up
                  </Link>
                </div>
              )}
              
              <div className="md:hidden ml-4">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 hover:text-primary-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                  onClick={toggleMobileMenu}
                >
                  <span className="sr-only">Open main menu</span>
                  <i className={`${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-xl`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            href="/"
            className={`${isActive('/') ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-500' : 'border-l-4 border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'} block pl-3 pr-4 py-2 font-medium`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/stores"
            className={`${isActive('/stores') ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-500' : 'border-l-4 border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'} block pl-3 pr-4 py-2 font-medium`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Stores
          </Link>
          <Link 
            href="/scanner"
            className={`${isActive('/scanner') ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-500' : 'border-l-4 border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'} block pl-3 pr-4 py-2 font-medium`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Scanner
          </Link>
          <Link 
            href="/orders"
            className={`${isActive('/orders') ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-500' : 'border-l-4 border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'} block pl-3 pr-4 py-2 font-medium`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Orders
          </Link>
          
          {user?.isStore && (
            <>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="pt-1 pb-1">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pharmacy Manager
                </h3>
              </div>
              <Link 
                href="/store-dashboard"
                className={`${isActive('/store-dashboard') ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-500' : 'border-l-4 border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'} block pl-3 pr-4 py-2 font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <i className="ri-store-3-line mr-2"></i>
                  My Pharmacy
                </span>
              </Link>
              <Link 
                href="/create-pharmacy"
                className={`${isActive('/create-pharmacy') ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-500' : 'border-l-4 border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'} block pl-3 pr-4 py-2 font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <i className="ri-add-circle-line mr-2"></i>
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
