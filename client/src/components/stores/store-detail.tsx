import { Link, useLocation } from "wouter";
import { formatCurrency, getOpenStatus } from "@/lib/utils";
import MedicationCard from "@/components/medications/medication-card";

interface Medication {
  id: number;
  name: string;
  dosage: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  quantity: number;
}

interface StoreDetailProps {
  store: {
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
  };
  inventory: Medication[];
  isLoading: boolean;
  onAddToCart: (medication: Medication, quantity: number) => void;
}

const StoreDetail = ({ store, inventory, isLoading, onAddToCart }: StoreDetailProps) => {
  const [, setLocation] = useLocation();
  const openStatus = getOpenStatus(store.openingHours);

  const handleViewDetails = (medicationId: number) => {
    setLocation(`/medications/${medicationId}?store=${store.id}`);
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="md:flex">
          <div className="md:w-1/2">
            {store.imageUrl ? (
              <img
                src={store.imageUrl}
                alt={`${store.name} interior`}
                className="w-full h-64 md:h-full object-cover"
              />
            ) : (
              <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
                <i className="ri-store-3-line text-5xl text-gray-400"></i>
              </div>
            )}
          </div>
          <div className="md:w-1/2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold text-neutral-900">{store.name}</h2>
              <div className="flex items-center bg-primary-50 rounded-full px-3 py-1">
                <i className="ri-star-fill text-yellow-400 mr-1"></i>
                <span className="text-sm font-medium text-neutral-700">
                  {store.rating.toFixed(1)} ({store.reviewCount} reviews)
                </span>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <i className="ri-map-pin-line text-neutral-500 mt-1 mr-3"></i>
                <div>
                  <p className="text-neutral-700">
                    {store.address}, {store.city}, {store.zipCode}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-time-line text-neutral-500 mt-1 mr-3"></i>
                <div>
                  <p className={`font-medium ${openStatus.className}`}>{openStatus.label}</p>
                  {store.openingHours.split(',').map((hours, index) => (
                    <p key={index} className="text-neutral-700 text-sm">{hours.trim()}</p>
                  ))}
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-phone-line text-neutral-500 mt-1 mr-3"></i>
                <div>
                  <p className="text-neutral-700">{store.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                Prescription Filling
              </span>
              <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                Medication Consultation
              </span>
              <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                Health Screenings
              </span>
              <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                Immunizations
              </span>
            </div>
            <div className="flex gap-2">
              <a 
                href={`tel:${store.phone}`} 
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md font-medium transition-colors flex justify-center items-center"
              >
                <i className="ri-phone-line mr-2"></i>
                Call
              </a>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(`${store.address}, ${store.city}, ${store.zipCode}`)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md font-medium transition-colors flex justify-center items-center"
              >
                <i className="ri-map-pin-line mr-2"></i>
                Directions
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-neutral-900">Available Medications</h2>
          <Link href="/cart" className="bg-accent-500 hover:bg-accent-600 text-white py-2 px-4 rounded-md font-medium text-sm transition-colors flex items-center shadow-md border border-accent-600">
            <i className="ri-shopping-cart-2-line mr-2"></i>
            View Cart
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onViewDetails={handleViewDetails}
              onAddToCart={(medicationId, quantity) => {
                // Find the medication and pass it to the onAddToCart function
                const med = inventory.find(m => m.id === medicationId);
                if (med) {
                  onAddToCart(med, quantity);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreDetail;
