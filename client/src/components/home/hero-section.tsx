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
    <div className="relative py-12 md:py-20 overflow-hidden bg-primary-500">
      <div className="container-custom relative z-10">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              {userCity 
                ? `Find medications in ${userCity}` 
                : "Find medications at your local pharmacies"}
            </h1>
            <p className="text-primary-100 text-lg mb-8">
              {userCity 
                ? `Search for medications, check availability, and order directly from stores in ${userCity}.`
                : "Search for medications, check availability, and order directly from nearby stores."}
            </p>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <form onSubmit={handleSearch}>
                  <div className="flex items-center border border-neutral-300 rounded-md focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
                    <div className="pl-3 pr-2">
                      <i className="ri-search-line text-neutral-400"></i>
                    </div>
                    <input
                      type="text"
                      className="block w-full py-2 pl-1 pr-3 border-none focus:outline-none focus:ring-0 text-neutral-900 placeholder-neutral-500"
                      placeholder="Search for medications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="w-full bg-primary-500 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <i className="ri-search-line mr-2"></i> Search Medications
                    </button>
                  </div>
                </form>
                
                {user?.isStore && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <button
                      onClick={navigateToCreatePharmacy}
                      className="w-full bg-accent-500 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
                    >
                      <i className="ri-store-3-line mr-2"></i> Create Your Pharmacy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col justify-center mt-10 md:mt-0">
            {/* Pharmacy storefront image */}
            <img
              src="https://pixabay.com/get/g9567d1a156ac0d7d855ee9c5a046e85c768ad7c39661971566f4a88a311d47ca98a22454d716534df3e13a14c1e1eeebf25a852e8e0779faf2f9a498aa606323_1280.jpg"
              alt="Modern pharmacy storefront"
              className="rounded-lg shadow-xl max-w-full h-auto"
            />
            
            {user?.isStore && (
              <div className="mt-4 bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="text-lg font-semibold mb-2">Pharmacy Owner?</h3>
                <p className="text-neutral-600 mb-3">Create and manage your pharmacy store to sell medications to customers in your city.</p>
                <button
                  onClick={navigateToCreatePharmacy}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-500 hover:bg-accent-600"
                >
                  <i className="ri-add-circle-line mr-2"></i> Make Pharmacy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-50"></div>
    </div>
  );
};

export default HeroSection;
