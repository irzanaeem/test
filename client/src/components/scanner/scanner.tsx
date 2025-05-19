import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const Scanner = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileSize = file.size / 1024 / 1024; // in MB
    if (fileSize > 10) {
      toast({
        title: "File too large",
        description: "Please upload an image less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImgSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Process with OCR
    setIsProcessing(true);
    setHasResult(false);

    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      setExtractedText(text);
      setHasResult(true);
      await worker.terminate();
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: "OCR Processing Failed",
        description: "Could not extract text from the image. Please try a clearer image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAreaClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    toast({
      title: "Text copied",
      description: "Prescription text has been copied to clipboard",
    });
  };

  const handleSearchMedications = () => {
    // Extract possible medication names from text
    // This is a simple implementation; in a production app,
    // you would use NLP or a more sophisticated approach
    const words = extractedText.split(/\s+/);
    const commonMedicationNames = words.filter(word => 
      word.length > 4 && 
      !word.match(/^\d/) && 
      word.match(/^[A-Z]/)
    ).join(' ');
    
    setLocation(`/stores?search=${encodeURIComponent(commonMedicationNames)}`);
  };

  const handleUploadNew = () => {
    setImgSrc(null);
    setExtractedText('');
    setHasResult(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-6">
        <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Upload Prescription</h2>
        <p className="text-gray-700 mb-6">
          Upload a clear image of your prescription and our OCR technology will extract the medication information for you.
        </p>
        
        {!hasResult && !isProcessing && (
          <div 
            className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={handleUploadAreaClick}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <i className="ri-upload-cloud-2-line text-5xl text-neutral-400"></i>
              </div>
              <div>
                <p className="text-gray-900">Drag and drop your prescription image here, or</p>
                <Button 
                  onClick={handleBrowseClick} 
                  className="mt-2"
                >
                  Browse Files
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
              </div>
              <p className="text-sm text-neutral-500">Supported file types: JPG, PNG, PDF (Max. 10MB)</p>
            </div>
          </div>
        )}
        
        {isProcessing && (
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              <p className="text-neutral-700">Processing your prescription...</p>
            </div>
          </div>
        )}
        
        {hasResult && imgSrc && (
          <div className="mt-6">
            <div className="border border-neutral-300 rounded-lg overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-neutral-300">
                  <img 
                    src={imgSrc} 
                    alt="Uploaded prescription" 
                    className="w-full h-auto rounded"
                  />
                </div>
                <div className="md:w-1/2 p-4">
                  <h3 className="font-heading font-semibold text-gray-900 mb-2">Extracted Information</h3>
                  <div className="bg-gray-50 p-3 rounded-md mb-4 max-h-[300px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {extractedText || "No text could be extracted. Please try a clearer image."}
                    </pre>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <Button variant="default" onClick={handleCopyText}>
                      <i className="ri-clipboard-line mr-2"></i>
                      Copy Text
                    </Button>
                    <Button variant="default" onClick={handleSearchMedications}>
                      <i className="ri-search-line mr-2"></i>
                      Search for Medications
                    </Button>
                    <Button variant="outline" onClick={handleUploadNew}>
                      Upload New Prescription
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 bg-white border-t border-neutral-200">
        <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-upload-cloud-line text-xl text-primary-500"></i>
            </div>
            <h3 className="font-heading font-medium text-gray-900 mb-2">1. Upload</h3>
            <p className="text-sm text-gray-700">Upload a clear image of your prescription.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-file-text-line text-xl text-primary-500"></i>
            </div>
            <h3 className="font-heading font-medium text-gray-900 mb-2">2. Process</h3>
            <p className="text-sm text-gray-700">Our OCR technology extracts the text from your prescription.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-search-line text-xl text-primary-500"></i>
            </div>
            <h3 className="font-heading font-medium text-gray-900 mb-2">3. Search</h3>
            <p className="text-sm text-gray-700">Search for medications from the extracted information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
