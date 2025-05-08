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
        <title>E Pharma - Find Medications at Local Pharmacies</title>
        <meta name="description" content="Search for medications, check availability, and order directly from nearby pharmacies. E Pharma connects you with local stores to find the medications you need." />
      </Helmet>
      
      <main>
        <HeroSection userCity={userCity} />
        <HowItWorks />
        <FeaturedStores userCity={userCity} />
        <ScannerFeature />
        <PopularMedications />
      </main>
    </>
  );
};

export default Home;
