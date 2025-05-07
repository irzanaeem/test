import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface CartItemProps {
  item: {
    id: number;
    name: string;
    dosage: string;
    imageUrl: string;
    price: number;
    quantity: number;
  };
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity);
  
  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onUpdateQuantity(item.id, newQuantity);
    }
  };
  
  const handleIncrease = () => {
    if (quantity < 99) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onUpdateQuantity(item.id, newQuantity);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 99) {
      setQuantity(value);
      onUpdateQuantity(item.id, value);
    }
  };
  
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-start">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-16 h-16 object-cover rounded-md mr-4"
        />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <div>
              <h3 className="font-heading font-semibold text-neutral-900">{item.name}</h3>
              <p className="text-sm text-neutral-500">{item.dosage}</p>
            </div>
            <div className="mt-2 sm:mt-0 sm:ml-4 text-right">
              <p className="text-primary-500 font-medium">{formatCurrency(item.price)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex border border-neutral-300 rounded-md">
              <button 
                className="px-2 py-1 border-r border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                onClick={handleDecrease}
              >
                -
              </button>
              <input 
                type="number" 
                value={quantity} 
                min="1" 
                max="99" 
                className="w-12 text-center border-none focus:ring-0"
                onChange={handleInputChange}
              />
              <button 
                className="px-2 py-1 border-l border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                onClick={handleIncrease}
              >
                +
              </button>
            </div>
            <button 
              className="text-red-500 hover:text-red-600 transition-colors"
              onClick={() => onRemove(item.id)}
            >
              <i className="ri-delete-bin-line"></i>
              <span className="hidden sm:inline ml-1">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
