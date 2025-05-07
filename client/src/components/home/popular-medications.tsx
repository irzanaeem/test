import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface Medication {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
}

const PopularMedications = () => {
  const [, setLocation] = useLocation();
  
  const { data: medications, isLoading, error } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  const viewMedicationDetails = (medicationId: number) => {
    setLocation(`/medications/${medicationId}`);
  };

  if (isLoading) {
    return (
      <div className="py-12 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-heading font-bold text-neutral-900">Popular Medications</h2>
            <p className="mt-4 text-neutral-600">The most commonly searched medications in your area</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden p-4 text-center">
                <Skeleton className="h-32 w-32 mx-auto rounded-full mb-4" />
                <Skeleton className="h-6 w-2/3 mx-auto mb-2" />
                <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
                <Skeleton className="h-8 w-full mt-2" />
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
            <h2 className="text-2xl font-heading font-bold text-neutral-900 mb-4">Popular Medications</h2>
            <p className="text-red-500">Failed to load medications. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show 4 medications for the popular section
  const popularMeds = medications?.slice(0, 4) || [];

  return (
    <div className="py-12 bg-neutral-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-heading font-bold text-neutral-900">Popular Medications</h2>
          <p className="mt-4 text-neutral-600">The most commonly searched medications in your area</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {popularMeds.map((medication) => (
            <div
              key={medication.id}
              className="bg-white rounded-lg shadow-md overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300 text-center"
            >
              <img
                src={medication.imageUrl}
                alt={medication.name}
                className="h-32 w-32 mx-auto object-cover rounded-full mb-4"
              />
              <h3 className="text-lg font-heading font-semibold text-neutral-900">{medication.name}</h3>
              <p className="text-sm text-neutral-500 mb-2">{medication.category}</p>
              <button
                onClick={() => viewMedicationDetails(medication.id)}
                className="mt-2 w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2 px-4 rounded-md font-medium transition-colors text-sm"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularMedications;
