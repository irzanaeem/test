import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { getOpenStatus, getDistanceLabel } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  openingHours: string;
  rating: number;
  imageUrl: string;
  distance: number;
}

interface FeaturedStoresProps {
  userCity?: string;
}

const FeaturedStores = ({ userCity = "" }: FeaturedStoresProps) => {
  const [, setLocation] = useLocation();
  
  const { data: stores, isLoading, error } = useQuery<Store[]>({
    queryKey: ['/api/stores', userCity ? { city: userCity } : null],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const url = userCity 
        ? `/api/stores?city=${encodeURIComponent(userCity)}`
        : '/api/stores';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      return response.json();
    },
  });

  const viewStore = (storeId: number) => {
    setLocation(`/stores/${storeId}`);
  };

  if (isLoading) {
    return (
      <div className="py-12 bg-neutral-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-heading font-bold text-neutral-900">Featured Pharmacies</h2>
            <Link
              href="/stores"
              className="text-primary-500 hover:text-primary-600 font-medium flex items-center"
            >
              View all <i className="ri-arrow-right-line ml-1"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full h-40" />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-2xl font-heading font-bold text-neutral-900 mb-4">Featured Pharmacies</h2>
            <p className="text-red-500">Failed to load pharmacies. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const featuredStores = stores?.slice(0, 3) || [];

  return (
    <div className="py-12 bg-neutral-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-heading font-bold text-neutral-900">
            {userCity ? `Pharmacies in ${userCity}` : "Featured Pharmacies"}
          </h2>
          <Link
            href="/stores"
            className="text-primary-500 hover:text-primary-600 font-medium flex items-center"
          >
            View all <i className="ri-arrow-right-line ml-1"></i>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStores.map((store) => {
            const openStatus = getOpenStatus(store.openingHours);
            return (
              <div
                key={store.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={store.imageUrl}
                  alt={store.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-heading font-semibold text-neutral-900">
                      {store.name}
                    </h3>
                    <div className="flex items-center bg-primary-50 rounded-full px-2 py-1">
                      <i className="ri-star-fill text-yellow-400 mr-1"></i>
                      <span className="text-sm font-medium text-neutral-700">{typeof store.rating === 'number' ? store.rating.toFixed(1) : '0.0'}</span>
                    </div>
                  </div>
                  <p className="text-neutral-600 text-sm mb-3">{store.address}</p>
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
                  <button
                    className="mt-4 w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                    onClick={() => viewStore(store.id)}
                  >
                    View Store
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturedStores;
