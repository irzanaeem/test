import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import HeroSection from "@/components/home/hero-section";
import HowItWorks from "@/components/home/how-it-works";
import FeaturedStores from "@/components/home/featured-stores";
import ScannerFeature from "@/components/home/scanner-feature";
import PopularMedications from "@/components/home/popular-medications";

const Home = () => {
  const { user } = useAuth();
  const userCity = user?.city || "";
  
  return (
    <>
      <Helmet>
        <title>
          {userCity 
            ? `E Pharma - Find Medications in ${userCity}` 
            : "E Pharma - Find Medications at Local Pharmacies"}
        </title>
        <meta 
          name="description" 
          content={userCity 
            ? `Search for medications, check availability, and order directly from pharmacies in ${userCity}. E Pharma connects you with local stores to find the medications you need.`
            : "Search for medications, check availability, and order directly from nearby pharmacies. E Pharma connects you with local stores to find the medications you need."
          } 
        />
      </Helmet>
      
      <main>
        <HeroSection userCity={userCity} />
        <HowItWorks userCity={userCity} />
        <FeaturedStores userCity={userCity} />
        <ScannerFeature userCity={userCity} />
        <PopularMedications userCity={userCity} />
      </main>
    </>
  );
};

export default Home;
