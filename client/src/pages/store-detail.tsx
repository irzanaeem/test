import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import StoreDetail from "@/components/stores/store-detail";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  openingHours: string;
  description?: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
}

interface Medication {
  id: number;
  name: string;
  description?: string;
  dosage: string;
  manufacturer?: string;
  category?: string;
  price: number;
  imageUrl: string;
  sideEffects?: string;
  usageInstructions?: string;
  inStock: boolean;
  quantity: number;
}

interface StoreInventoryItem {
  id: number;
  medication: Medication;
  inStock: boolean;
  quantity: number;
  price: number;
}

const StoreDetailPage = () => {
  const params = useParams<{ id: string }>();
  const storeId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInventory, setFilteredInventory] = useState<Medication[]>([]);
  
  // Fetch store details
  const { data: store, isLoading: isLoadingStore } = useQuery<Store>({
    queryKey: [`/api/stores/${storeId}`],
    enabled: !isNaN(storeId),
  });
  
  // Fetch store inventory
  const { data: inventory, isLoading: isLoadingInventory } = useQuery<StoreInventoryItem[]>({
    queryKey: [`/api/stores/${storeId}/inventory`],
    enabled: !isNaN(storeId),
  });
  
  // Process inventory data
  useEffect(() => {
    if (inventory) {
      const processedInventory = inventory.map(item => ({
        ...item.medication,
        inStock: item.inStock,
        quantity: item.quantity,
        price: item.price || item.medication.price
      }));
      
      // Apply search filter
      if (searchTerm.trim()) {
        const lowercaseSearch = searchTerm.toLowerCase();
        const filtered = processedInventory.filter(med => 
          med.name.toLowerCase().includes(lowercaseSearch) || 
          (med.dosage && med.dosage.toLowerCase().includes(lowercaseSearch))
        );
        setFilteredInventory(filtered);
      } else {
        setFilteredInventory(processedInventory);
      }
    }
  }, [inventory, searchTerm]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Just use the current searchTerm state
    // We're already filtering in the useEffect
  };
  
  const handleBackClick = () => {
    setLocation("/stores");
  };
  
  const addToCart = (medication: Medication, quantity: number = 1) => {
    // Use the cart hook to add the item
    addItem({
      ...medication,
      description: medication.description || '',
      category: medication.category || null,
      manufacturer: medication.manufacturer || null,
      sideEffects: medication.sideEffects || null,
      usageInstructions: medication.usageInstructions || null,
      storeId: storeId,
      storeName: store?.name || "Store",
      inventoryPrice: medication.price
    }, quantity);
  };
  
  const isLoading = isLoadingStore || isLoadingInventory;

  if (!isNaN(storeId) && !isLoading && !store) {
    return (
      <div className="container-custom py-10 text-center">
        <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-4">
          Pharmacy Not Found
        </h1>
        <p className="text-neutral-600 mb-6">
          The pharmacy you're looking for could not be found.
        </p>
        <Button onClick={() => setLocation("/stores")}>
          Back to Pharmacies
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{store ? `${store.name} - MediFind` : "Pharmacy Details - MediFind"}</title>
        <meta 
          name="description" 
          content={store ? `Browse medications available at ${store.name}. Check prices, availability, and place orders for pickup.` : "View pharmacy details and available medications."} 
        />
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
            <h1 className="text-2xl font-heading font-bold text-white">
              {isLoading ? "Loading..." : store?.name}
            </h1>
          </div>
        </div>
      </div>
      
      <div className="container-custom py-6">
        {isLoading ? (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <Skeleton className="w-full h-64 md:h-full" />
                </div>
                <div className="md:w-1/2 p-6">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <div className="space-y-3 mb-6">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-2/3" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-10 w-1/3" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden p-4">
                    <div className="flex items-start">
                      <Skeleton className="w-16 h-16 rounded-md mr-4" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-5 w-1/4 mt-2" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-full mt-3" />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : store && filteredInventory ? (
          <>
            <StoreDetail 
              store={store} 
              inventory={filteredInventory}
              isLoading={isLoading}
              onAddToCart={addToCart}
            />
            
            <div className="mb-6 mt-8">
              <form onSubmit={handleSearch}>
                <div className="relative flex items-center mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-search-line text-neutral-400"></i>
                  </div>
                  <Input
                    id="medication-search"
                    type="text"
                    className="pl-10 pr-3 py-2"
                    placeholder="Search medications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading pharmacy data. Please try again later.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default StoreDetailPage;
