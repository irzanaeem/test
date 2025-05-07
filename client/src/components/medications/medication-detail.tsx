import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface MedicationDetailProps {
  medication: {
    id: number;
    name: string;
    description: string;
    dosage: string;
    manufacturer?: string;
    category?: string;
    price: number;
    imageUrl: string;
    sideEffects?: string;
    usageInstructions?: string;
    inStock?: boolean;
    quantity?: number;
  };
  storeName: string;
  onAddToCart: (quantity: number) => void;
}

const MedicationDetail = ({ medication, storeName, onAddToCart }: MedicationDetailProps) => {
  const [quantity, setQuantity] = useState(1);
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 99) {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = () => {
    onAddToCart(quantity);
  };
  
  const getStockStatus = () => {
    if (medication.inStock === false || medication.quantity === 0) {
      return {
        text: "Out of Stock",
        className: "text-red-500",
        icon: "ri-close-circle-line"
      };
    }
    
    if (medication.quantity !== undefined && medication.quantity <= 10) {
      return {
        text: "Low Stock",
        className: "text-orange-500",
        icon: "ri-error-warning-line"
      };
    }
    
    return {
      text: "In Stock",
      className: "text-green-600",
      icon: "ri-checkbox-circle-line"
    };
  };
  
  const stockStatus = getStockStatus();
  const isOutOfStock = medication.inStock === false || medication.quantity === 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6">
          <div className="mb-4 md:mb-0">
            <img
              src={medication.imageUrl}
              alt={`${medication.name} ${medication.dosage}`}
              className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-2">
              {medication.name}
            </h2>
            <p className="text-neutral-600 mb-2">{medication.dosage}</p>
            <div className={`flex items-center text-sm ${stockStatus.className} mb-4`}>
              <i className={`${stockStatus.icon} mr-1`}></i>
              {stockStatus.text} at {storeName}
            </div>
            <p className="text-primary-500 font-medium text-xl mb-4">
              {formatCurrency(medication.price)}
            </p>
            {!isOutOfStock && (
              <div className="flex items-center">
                <div className="flex border border-neutral-300 rounded-md">
                  <button
                    className="px-3 py-1 border-r border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                    onClick={decreaseQuantity}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min="1"
                    max="99"
                    className="w-12 text-center border-none focus:ring-0"
                    onChange={handleQuantityChange}
                  />
                  <button
                    className="px-3 py-1 border-l border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                </div>
                <button
                  className="ml-4 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md font-medium transition-colors flex items-center"
                  onClick={handleAddToCart}
                >
                  <i className="ri-shopping-cart-2-line mr-2"></i>
                  Add to Cart
                </button>
              </div>
            )}
            {isOutOfStock && (
              <button
                className="px-6 py-2 bg-neutral-300 text-neutral-500 cursor-not-allowed rounded-md font-medium"
                disabled
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-3">
            About This Medication
          </h3>
          <div className="prose max-w-none text-neutral-700">
            <p>{medication.description}</p>
            
            {medication.manufacturer && (
              <div className="mt-4">
                <h4 className="text-neutral-900 font-medium mb-2">Manufacturer</h4>
                <p>{medication.manufacturer}</p>
              </div>
            )}
            
            {medication.sideEffects && (
              <>
                <h4 className="text-neutral-900 font-medium mt-4 mb-2">Common Side Effects</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {medication.sideEffects.split(',').map((effect, index) => (
                    <li key={index}>{effect.trim()}</li>
                  ))}
                </ul>
              </>
            )}
            
            {medication.usageInstructions && (
              <>
                <h4 className="text-neutral-900 font-medium mt-4 mb-2">Usage Instructions</h4>
                <p>{medication.usageInstructions}</p>
              </>
            )}
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> This information is for educational purposes only. Always consult with a healthcare professional before taking this medication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationDetail;
