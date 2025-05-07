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
  onAddToCart?: (id: number) => void;
}

const MedicationCard = ({ medication, onViewDetails, onAddToCart }: MedicationCardProps) => {
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
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start">
        <img
          src={medication.imageUrl}
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
      
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onViewDetails(medication.id)}
          className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2 px-4 rounded-md font-medium text-sm transition-colors"
        >
          View Details
        </button>
        
        {onAddToCart && (
          medication.inStock !== false && (medication.quantity === undefined || medication.quantity > 0) ? (
            <button
              onClick={() => onAddToCart(medication.id)}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md font-medium text-sm transition-colors"
            >
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
    </div>
  );
};

export default MedicationCard;
