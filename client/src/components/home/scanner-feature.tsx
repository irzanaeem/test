import { useLocation } from "wouter";

const ScannerFeature = () => {
  const [, setLocation] = useLocation();

  const handleTryScanner = () => {
    setLocation("/scanner");
  };

  return (
    <div className="py-12 bg-white">
      <div className="container-custom">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h2 className="text-3xl font-heading font-bold text-neutral-900 mb-4">Prescription Scanner</h2>
            <p className="text-lg text-neutral-600 mb-6">
              Upload your prescription and our OCR technology will extract the text for you.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <i className="ri-check-line text-green-500 text-xl"></i>
                </div>
                <div className="ml-3">
                  <p className="text-neutral-700">Quickly extract text from your prescriptions</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <i className="ri-check-line text-green-500 text-xl"></i>
                </div>
                <div className="ml-3">
                  <p className="text-neutral-700">Easily search for medications from the extracted text</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <i className="ri-check-line text-green-500 text-xl"></i>
                </div>
                <div className="ml-3">
                  <p className="text-neutral-700">Save time by avoiding manual typing</p>
                </div>
              </li>
            </ul>
            <div className="mt-8">
              <button
                className="bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-md font-medium transition-colors flex items-center"
                onClick={handleTryScanner}
              >
                <i className="ri-camera-line mr-2"></i>
                Try Scanner
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* Prescription form image */}
            <img
              src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Prescription form with medication details"
              className="rounded-lg shadow-lg max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerFeature;
