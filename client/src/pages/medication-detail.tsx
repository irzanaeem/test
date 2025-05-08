import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import MedicationDetail from "@/components/medications/medication-detail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Medication {
  id: number;
  name: string;
  description: string;
  dosage: string;
  manufacturer?: string;
  category?: string;
  price: number;
  imageUrl: string;
  sideEffects?: string;
  usageInstructions?: string;
}

interface StoreInventoryItem {
  id: number;
  storeId: number;
  medication: Medication;
  inStock: boolean;
  quantity: number;
  price: number;
  store?: {
    id: number;
    name: string;
  };
}

const MedicationDetailPage = () => {
  const params = useParams<{ id: string }>();
  const medicationId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [storeInventoryItem, setStoreInventoryItem] = useState<StoreInventoryItem | null>(null);
  
  // Get query parameters for store if available
  const currentLocation = useLocation()[0];
  const queryParams = new URLSearchParams(currentLocation.split('?')[1]);
  const storeIdParam = queryParams.get('store');
  const storeId = storeIdParam ? parseInt(storeIdParam) : null;
  
  // Fetch medication details
  const { data: medication, isLoading: isLoadingMedication } = useQuery<Medication>({
    queryKey: [`/api/medications/${medicationId}`],
    enabled: !isNaN(medicationId),
  });
  
  // If a store ID is provided, get inventory from that store
  const { data: inventoryData, isLoading: isLoadingInventory } = useQuery<StoreInventoryItem>({
    queryKey: [`/api/stores/${storeId}/inventory/${medicationId}`],
    enabled: !isNaN(medicationId) && storeId !== null && !isNaN(storeId),
  });
  
  // If we have both store ID and inventory data, set it
  useEffect(() => {
    if (inventoryData) {
      setStoreInventoryItem(inventoryData);
    }
  }, [inventoryData]);
  
  const handleBackClick = () => {
    if (storeId) {
      setLocation(`/stores/${storeId}`);
    } else {
      setLocation("/stores");
    }
  };
  
  const addToCart = (quantity: number) => {
    if (!medication || !storeInventoryItem) return;
    
    // Use the cart hook to add the item
    addItem({
      ...medication,
      storeId: storeInventoryItem.storeId,
      storeName: storeInventoryItem.store?.name || "Store",
      inventoryPrice: storeInventoryItem.price || medication.price
    }, quantity);
  };
  
  const isLoading = isLoadingMedication || (storeId !== null && isLoadingInventory);
  
  // Prepare medication data with inventory info if available
  const combinedMedicationData = medication && storeInventoryItem ? {
    ...medication,
    inStock: storeInventoryItem.inStock,
    quantity: storeInventoryItem.quantity,
    price: storeInventoryItem.price || medication.price
  } : medication;
  
  const storeName = storeInventoryItem?.store?.name || "Selected Store";

  if (!isNaN(medicationId) && !isLoading && !medication) {
    return (
      <div className="container-custom py-10 text-center">
        <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-4">
          Medication Not Found
        </h1>
        <p className="text-neutral-600 mb-6">
          The medication you're looking for could not be found.
        </p>
        <Button onClick={() => setLocation("/stores")}>
          Browse Pharmacies
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{medication ? `${medication.name} - MediFind` : "Medication Details - MediFind"}</title>
        <meta 
          name="description" 
          content={medication ? `View details, pricing, and availability for ${medication.name} ${medication.dosage}. Learn about side effects, usage instructions, and order online.` : "View medication details, pricing, and availability information."} 
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
              {isLoading ? "Loading..." : medication?.name}
            </h1>
          </div>
        </div>
      </div>
      
      <div className="container-custom py-6">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6">
                <div className="mb-4 md:mb-0">
                  <Skeleton className="w-32 h-32 md:w-48 md:h-48 rounded-lg" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-5 w-2/3 mb-4" />
                  <Skeleton className="h-7 w-1/4 mb-4" />
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-32 mr-4" />
                    <Skeleton className="h-10 w-40" />
                  </div>
                </div>
              </div>
              <div className="border-t border-neutral-200 pt-6">
                <Skeleton className="h-7 w-1/3 mb-3" />
                <Skeleton className="h-4 w-full my-2" />
                <Skeleton className="h-4 w-full my-2" />
                <Skeleton className="h-4 w-full my-2" />
                <Skeleton className="h-4 w-4/5 my-2" />
              </div>
            </div>
          </div>
        ) : combinedMedicationData ? (
          <MedicationDetail 
            medication={combinedMedicationData}
            storeName={storeName}
            onAddToCart={addToCart}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading medication data. Please try again later.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default MedicationDetailPage;
