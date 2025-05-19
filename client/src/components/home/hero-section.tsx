import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface HeroSectionProps {
  userCity?: string;
}

const HeroSection = ({ userCity = "" }: HeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/stores?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const navigateToCreatePharmacy = () => {
    setLocation("/create-pharmacy");
  };

  return (
    <div className="relative py-12 md:py-20 overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-500 to-secondary-500 opacity-20 blur-3xl z-0 animate-gradient-move bg-[length:200%_200%]"></div>
      <div className="container-custom relative z-10 flex flex-col items-center justify-center min-h-[40vh]">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            {userCity 
              ? `Find medications in ${userCity}` 
              : "Find medications at your local pharmacies"}
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            {userCity 
              ? `Search for medications, check availability, and order directly from stores in ${userCity}.`
              : "Search for medications, check availability, and order directly from nearby stores."}
          </p>
          <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border/50">
            <div className="p-4">
              <form onSubmit={handleSearch}>
                <div className="flex items-center border border-border rounded-md focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 bg-card">
                  <div className="pl-3 pr-2">
                    <i className="ri-search-line text-muted-foreground"></i>
                  </div>
                  <input
                    type="text"
                    className="block w-full py-2 pl-1 pr-3 border-none focus:outline-none focus:ring-0 text-foreground placeholder-muted-foreground bg-transparent"
                    placeholder="Search for medications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="w-full bg-primary-500 hover:bg-primary-600 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <i className="ri-search-line mr-2"></i> Search Medications
                  </button>
                </div>
              </form>
              {user?.isStore && (
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={navigateToCreatePharmacy}
                    className="w-full bg-accent-500 hover:bg-accent-600 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                  >
                    <i className="ri-store-3-line mr-2"></i> Create Your Pharmacy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
