import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface MedicationCardProps {
  medication: {
    id: number;
    name: string;
    dosage: string;
    price: number;
    imageUrl: string;
    category?: string;
    inStock?: boolean;
    quantity?: number;
  };
  onViewDetails: (id: number) => void;
  onAddToCart?: (id: number, quantity: number) => void;
}

const MedicationCard = ({ medication, onViewDetails, onAddToCart }: MedicationCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);
  
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
  const isAvailable = medication.inStock !== false && (medication.quantity === undefined || medication.quantity > 0);
  
  const handleAddToCart = () => {
    if (onAddToCart && isAvailable) {
      onAddToCart(medication.id, quantity);
      setShowQuantity(false);
      setQuantity(1);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start">
        <img
          src={medication.imageUrl.startsWith('/uploads/') ? `http://localhost:5000${medication.imageUrl}` : medication.imageUrl}
          alt={medication.name}
          className="w-16 h-16 object-cover rounded-md mr-4"
        />
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-neutral-900">{medication.name}</h3>
          <p className="text-sm text-neutral-500 mb-2">{medication.dosage}</p>
          {(medication.inStock !== undefined || medication.quantity !== undefined) && (
            <div className={`flex items-center text-sm ${stockStatus.className}`}>
              <i className={`${stockStatus.icon} mr-1`}></i>
              {stockStatus.text}
            </div>
          )}
          {medication.category && (
            <p className="text-sm text-neutral-600">{medication.category}</p>
          )}
          <p className="text-primary-500 font-medium mt-2">{formatCurrency(medication.price)}</p>
        </div>
      </div>
      
      {showQuantity && isAvailable ? (
        <div className="mt-3">
          <div className="flex items-center mb-2">
            <div className="flex-1 mr-2">
              <div className="flex border border-neutral-300 rounded-md">
                <button
                  className="px-3 py-1 border-r border-blue-500 bg-blue-500 text-white hover:bg-blue-600 rounded-l-md"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  title="Decrease quantity"
                >
                  <span aria-hidden="true">-</span>
                </button>
                <input
                  type="number"
                  value={quantity}
                  min="1"
                  max="99"
                  className="w-full text-center border-none focus:ring-0"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1) setQuantity(val);
                  }}
                />
                <button
                  className="px-3 py-1 border-l border-blue-500 bg-blue-500 text-white hover:bg-blue-600 rounded-r-md"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                  title="Increase quantity"
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-primary-500 hover:bg-primary-600 text-white py-1 px-3 rounded-md font-medium text-sm transition-colors border border-primary-600 shadow-sm"
            >
              Add
            </button>
          </div>
          <button
            onClick={() => setShowQuantity(false)}
            className="w-full text-center text-blue-600 font-semibold text-xs hover:text-blue-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onViewDetails(medication.id)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium text-sm transition-colors"
          >
            View Details
          </button>
          
          {onAddToCart && (
            isAvailable ? (
              <button
                onClick={() => setShowQuantity(true)}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md font-medium text-sm transition-colors flex items-center justify-center shadow-md border border-primary-600"
              >
                <i className="ri-shopping-cart-2-line mr-1"></i>
                Add to Cart
              </button>
            ) : (
              <button
                className="flex-1 bg-neutral-300 text-neutral-500 cursor-not-allowed py-2 px-4 rounded-md font-medium text-sm"
                disabled
              >
                Out of Stock
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default MedicationCard;
