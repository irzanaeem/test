import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import StoreCard from "@/components/stores/store-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  openingHours: string;
  rating: number;
  reviewCount: number;
  distance: number;
  imageUrl: string;
}

const Stores = () => {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [filterBy, setFilterBy] = useState("all");
  const { user } = useAuth();
  const userCity = user?.city || "";
  
  // Extract search query from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location]);
  
  // Fetch stores
  const { data: stores, isLoading, error } = useQuery<Store[]>({
    queryKey: ['/api/stores', searchTerm, userCity],
    queryFn: async ({ queryKey }) => {
      const [_, query, city] = queryKey as [string, string, string];
      let url = '/api/stores';
      
      // Add query parameters if they exist
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (city) params.append('city', city);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      return response.json();
    },
  });
  
  // Sort and filter stores
  const processedStores = () => {
    if (!stores) return [];
    
    let result = [...stores];
    
    // Apply filter
    if (filterBy === "open") {
      // In a real app, this would be handled server-side
      // or with more complex logic based on actual opening hours
      result = result.filter(store => {
        // Simple simulation: random determination if store is open
        const isOpen = Math.random() > 0.2;
        return isOpen;
      });
    }
    
    // Apply sorting
    if (sortBy === "distance") {
      result.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }
    
    return result;
  };
  
  const filteredStores = processedStores();
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search term
    if (searchTerm.trim()) {
      setLocation(`/stores?search=${encodeURIComponent(searchTerm)}`);
    } else {
      setLocation('/stores');
    }
  };

  return (
    <>
      <Helmet>
        <title>{userCity ? `Pharmacies in ${userCity}` : "Nearby Pharmacies"} - E Pharma</title>
        <meta name="description" content={userCity 
          ? `Find pharmacies in ${userCity} that stock the medications you need. Browse local stores, check availability, and place orders for pickup.`
          : "Find pharmacies near you that stock the medications you need. Browse local stores, check availability, and place orders for pickup."} 
        />
      </Helmet>
      
      <div className="bg-primary-500 py-6">
        <div className="container-custom">
          <h1 className="text-2xl font-heading font-bold text-white">
            {userCity ? `Pharmacies in ${userCity}` : "Nearby Pharmacies"}
          </h1>
        </div>
      </div>
      
      <div className="container-custom py-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearch}>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-search-line text-neutral-400"></i>
                  </div>
                  <Input
                    type="text"
                    className="pl-10 pr-3 py-2"
                    placeholder="Search for pharmacies..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </form>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-700">Sort by:</span>
              <Select defaultValue="distance" onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-700">Filter:</span>
              <Select defaultValue="all" onValueChange={setFilterBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stores</SelectItem>
                  <SelectItem value="open">Open now</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
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
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading pharmacies. Please try again later.</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg font-medium text-neutral-700">No pharmacies found matching your criteria.</p>
            <p className="text-neutral-500 mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Stores;
