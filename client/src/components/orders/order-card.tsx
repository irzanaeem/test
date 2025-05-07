import { formatDate, formatCurrency, generateOrderNumber } from "@/lib/utils";
import { Link } from "wouter";

interface OrderMedication {
  id: number;
  name: string;
  dosage: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface OrderCardProps {
  order: {
    id: number;
    status: string;
    totalAmount: number;
    createdAt: string | Date;
    pickupTime: string;
    store: {
      id: number;
      name: string;
      address: string;
      city: string;
    };
    items: OrderMedication[];
  };
}

const OrderCard = ({ order }: OrderCardProps) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Processing';
      case 'ready':
        return 'Ready for pickup';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <div className="flex items-center">
              <h3 className="font-heading font-semibold text-neutral-900">
                {generateOrderNumber(order.id)}
              </h3>
              <span className={`ml-3 px-2 py-1 text-xs font-medium ${getStatusBadgeClass(order.status)} rounded-full`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <p className="text-sm text-neutral-600 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <Link 
              href={`/orders/${order.id}`} 
              className="text-primary-500 hover:text-primary-600 font-medium text-sm transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
        <div className="border-t border-neutral-200 pt-4">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-medium text-neutral-900">{order.store.name}</p>
              <p className="text-sm text-neutral-600">{order.store.address}, {order.store.city}</p>
              <p className="text-sm text-neutral-600 mt-2">Pickup: {order.pickupTime}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-neutral-900">{formatCurrency(order.totalAmount)}</p>
              <p className="text-sm text-neutral-600">{order.items.length} items</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex flex-wrap gap-4">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-md"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500">{item.dosage} × {item.quantity}</p>
                  </div>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-neutral-100 rounded-md flex items-center justify-center">
                    <span className="text-sm font-medium text-neutral-700">+{order.items.length - 3}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">More items</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
