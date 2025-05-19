import { Helmet } from "react-helmet";
import Scanner from "@/components/scanner/scanner";

const ScannerPage = () => {
  return (
    <>
      <Helmet>
        <title>Prescription Scanner - E Pharma</title>
        <meta name="description" content="Upload your prescription and our OCR technology will extract the text for you. Easily search for medications from the extracted information on E Pharma." />
      </Helmet>
      
      <div className="bg-transparent py-6">
        <div className="container-custom">
          <h1 className="text-2xl font-heading font-bold text-white">OCR Prescription Reader</h1>
        </div>
      </div>
      
      <div className="container-custom max-w-3xl py-6">
        <Scanner />
      </div>
    </>
  );
};

export default ScannerPage;
