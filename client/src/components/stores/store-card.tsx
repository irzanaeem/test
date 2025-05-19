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
    <div className="glass-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img
        src={store.imageUrl}
        alt={store.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-heading font-semibold text-white">{store.name}</h3>
          <div className="flex items-center bg-black/70 rounded-full px-2 py-1">
            <i className="ri-star-fill text-yellow-400 mr-1"></i>
            <span className="text-sm font-medium text-white">
              {typeof store.rating === 'number' ? store.rating.toFixed(1) : '0.0'}
              <span className="text-xs text-white ml-1">({typeof store.reviewCount === 'number' ? store.reviewCount : 0})</span>
            </span>
          </div>
        </div>
        <p className="text-white text-sm mb-3">
          {store.address}, {store.city}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className={`flex items-center ${openStatus.className} text-white`}>
            <i className="ri-time-line mr-1"></i>
            {openStatus.label}
          </span>
          <span className="flex items-center text-white">
            <i className="ri-map-pin-line mr-1"></i>
            {getDistanceLabel(store.distance) || 'Distance unknown'}
          </span>
        </div>
        <div className="mt-4 text-sm text-white">
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
