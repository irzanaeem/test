import { Helmet } from "react-helmet";
import HeroSection from "@/components/home/hero-section";
import HowItWorks from "@/components/home/how-it-works";
import FeaturedStores from "@/components/home/featured-stores";
import ScannerFeature from "@/components/home/scanner-feature";
import PopularMedications from "@/components/home/popular-medications";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>MediFind - Find Medications at Local Pharmacies</title>
        <meta name="description" content="Search for medications, check availability, and order directly from nearby pharmacies. MediFind connects you with local stores to find the medications you need." />
      </Helmet>
      
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturedStores />
        <ScannerFeature />
        <PopularMedications />
      </main>
    </>
  );
};

export default Home;
