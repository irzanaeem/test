import { Link } from "wouter";
import { getOpenStatus, getDistanceLabel } from "@/lib/utils";

interface StoreCardProps {
  store: {
    id: number;
    name: string;
    address: string;
    city: string;
    openingHours: string;
    rating: number;
    reviewCount?: number;
    imageUrl: string;
    distance: number;
  };
}

const StoreCard = ({ store }: StoreCardProps) => {
  const openStatus = getOpenStatus(store.openingHours);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img
        src={store.imageUrl}
        alt={store.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-heading font-semibold text-neutral-900">{store.name}</h3>
          <div className="flex items-center bg-primary-50 rounded-full px-2 py-1">
            <i className="ri-star-fill text-yellow-400 mr-1"></i>
            <span className="text-sm font-medium text-neutral-700">
              {store.rating.toFixed(1)}
              {store.reviewCount && <span className="text-xs text-neutral-500 ml-1">({store.reviewCount})</span>}
            </span>
          </div>
        </div>
        <p className="text-neutral-600 text-sm mb-3">
          {store.address}, {store.city}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className={`flex items-center ${openStatus.className}`}>
            <i className="ri-time-line mr-1"></i>
            {openStatus.label}
          </span>
          <span className="flex items-center text-neutral-500">
            <i className="ri-map-pin-line mr-1"></i>
            {getDistanceLabel(store.distance)}
          </span>
        </div>
        <div className="mt-4 text-sm text-neutral-600">
          <p>Medications available: 200+</p>
        </div>
        <Link href={`/stores/${store.id}`} className="mt-4 w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center">
          View Store
        </Link>
      </div>
    </div>
  );
};

export default StoreCard;
