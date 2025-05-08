import { Link } from "wouter";
import { formatCurrency, getOpenStatus } from "@/lib/utils";

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
  onAddToCart: (medication: Medication) => void;
}

const StoreDetail = ({ store, inventory, isLoading, onAddToCart }: StoreDetailProps) => {
  const openStatus = getOpenStatus(store.openingHours);

  const getStockStatusClass = (inStock: boolean, quantity: number) => {
    if (!inStock || quantity === 0) return "text-red-500";
    if (quantity <= 10) return "text-orange-500";
    return "text-green-600";
  };

  const getStockStatusIcon = (inStock: boolean, quantity: number) => {
    if (!inStock || quantity === 0) return "ri-close-circle-line";
    if (quantity <= 10) return "ri-error-warning-line";
    return "ri-checkbox-circle-line";
  };

  const getStockStatusText = (inStock: boolean, quantity: number) => {
    if (!inStock || quantity === 0) return "Out of Stock";
    if (quantity <= 10) return "Low Stock";
    return "In Stock";
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((medication) => (
            <div
              key={medication.id}
              className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden p-4 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start">
                {medication.imageUrl ? (
                  <img
                    src={medication.imageUrl}
                    alt={medication.name}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md mr-4">
                    <i className="ri-capsule-line text-2xl text-gray-400"></i>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-neutral-900">{medication.name}</h3>
                  <p className="text-sm text-neutral-500 mb-2">{medication.dosage}</p>
                  <div className={`flex items-center text-sm ${getStockStatusClass(medication.inStock, medication.quantity)}`}>
                    <i className={`${getStockStatusIcon(medication.inStock, medication.quantity)} mr-1`}></i>
                    {getStockStatusText(medication.inStock, medication.quantity)}
                  </div>
                  <p className="text-primary-500 font-medium mt-2">{formatCurrency(medication.price)}</p>
                </div>
              </div>
              {medication.inStock && medication.quantity > 0 ? (
                <button 
                  onClick={() => onAddToCart(medication)}
                  className="mt-3 w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md font-medium text-sm transition-colors"
                >
                  Add to Cart
                </button>
              ) : (
                <button 
                  className="mt-3 w-full bg-neutral-300 text-neutral-500 cursor-not-allowed py-2 px-4 rounded-md font-medium text-sm"
                  disabled
                >
                  Out of Stock
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreDetail;
