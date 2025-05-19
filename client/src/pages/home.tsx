import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

const features = [
  {
    icon: "ri-map-pin-2-line",
    title: "Find Nearby Pharmacies",
    desc: "Locate the nearest pharmacies with real-time availability and pricing information.",
  },
  {
    icon: "ri-scan-2-line",
    title: "Scan Prescriptions",
    desc: "Upload your prescription and let our system find the medications you need.",
  },
  {
    icon: "ri-truck-line",
    title: "Quick Pickup",
    desc: "Order online and pick up your medications at your convenience.",
  },
];

const steps = [
  { title: "Find a Pharmacy", desc: "Search for pharmacies near you." },
  { title: "Check Availability", desc: "See which medications are in stock." },
  { title: "Place Order", desc: "Order your medications online." },
  { title: "Pick Up", desc: "Collect your order at the pharmacy." },
];

const testimonials = [
  { name: "Ayesha", avatar: "/avatars/1.png" },
  { name: "Ali", avatar: "/avatars/2.png" },
  { name: "Sara", avatar: "/avatars/3.png" },
  { name: "Usman", avatar: "/avatars/4.png" },
];

const HomePage = () => {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/stores");
    setSearch("");
  };

  return (
    <>
      <Helmet>
        <title>E Pharma - Find Your Nearest Pharmacy</title>
        <meta 
          name="description" 
          content="Find the nearest pharmacy, check medication availability, and get your prescriptions filled quickly with E Pharma."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-500 via-teal-200 to-white">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-card max-w-3xl w-full mx-4 flex flex-col items-center gap-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900">Find Your Nearest Pharmacy</h1>
            <p className="text-lg text-blue-800 mb-6">
              Locate pharmacies, check medication availability, and get your prescriptions filled quickly.
            </p>
            <form className="w-full flex justify-center" onSubmit={handleSearch}>
              <div className="flex w-full max-w-md bg-white/80 rounded-full shadow-lg overflow-hidden border border-blue-200 focus-within:ring-2 focus-within:ring-blue-400">
                <input
                  type="text"
                  placeholder="Search for a medication or pharmacy..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 px-5 py-3 bg-transparent outline-none text-blue-900 placeholder:text-blue-400 border-none focus:ring-0 focus:border-none rounded-l-full"
                />
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-r-full hover:from-blue-600 hover:to-teal-500 transition-all border-none focus:ring-0 focus:border-none">
                  Search
                </button>
              </div>
            </form>
            <div className="flex gap-4 mt-6 justify-center">
              <Link href="/stores">
                <Button className="modern-btn">Find Pharmacies</Button>
              </Link>
              <Link href="/scanner">
                <Button className="modern-btn-outline">Scan Prescription</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Why Choose E Pharma?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="modern-card group cursor-pointer">
                <div className="modern-icon group-hover:text-teal-500 transition-colors">
                  <i className={f.icon}></i>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-blue-900">{f.title}</h3>
                <p className="text-blue-800">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Stepper */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center bg-gradient-to-br from-blue-400 to-teal-300 rounded-2xl shadow-lg px-8 py-6 min-w-[180px] max-w-xs">
                <div className="w-10 h-10 flex items-center justify-center bg-white/80 rounded-full mb-3 font-bold text-xl text-blue-700 shadow">{idx + 1}</div>
                <span className="text-lg font-semibold text-blue-900 mb-2 text-center">{step.title}</span>
                <span className="text-blue-800 text-center text-sm">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card max-w-3xl mx-auto text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4 text-blue-900">Ready to Get Started?</h2>
            <p className="text-lg text-blue-800 mb-8">
              Join <span className="font-bold text-teal-600">10,000+</span> users who trust E Pharma for their medication needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/stores">
                <Button className="modern-btn">Find Pharmacies</Button>
              </Link>
              <Link href="/auth?mode=register">
                <Button className="modern-btn-outline">Sign Up Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
