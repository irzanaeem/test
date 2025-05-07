import { formatDate } from "@/lib/utils";
import { Link } from "wouter";

interface NotificationItemProps {
  notification: {
    id: number;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string | Date;
    relatedOrderId?: number;
  };
  onMarkAsRead: (id: number) => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'order':
        return 'ri-shopping-bag-line';
      case 'promotion':
        return 'ri-coupon-line';
      case 'reminder':
        return 'ri-timer-line';
      case 'info':
        return 'ri-information-line';
      default:
        return 'ri-notification-line';
    }
  };
  
  const getIconBgForType = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100';
      case 'promotion':
        return 'bg-primary-100';
      case 'reminder':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-green-100';
      default:
        return 'bg-neutral-100';
    }
  };
  
  const getIconColorForType = (type: string) => {
    switch (type) {
      case 'order':
        return 'text-primary-500';
      case 'promotion':
        return 'text-primary-500';
      case 'reminder':
        return 'text-yellow-500';
      case 'info':
        return 'text-green-500';
      default:
        return 'text-neutral-500';
    }
  };
  
  const timeSince = formatDate(notification.createdAt);
  
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div 
      className={`p-4 ${!notification.read ? 'bg-blue-50' : ''}`}
      onClick={handleClick}
    >
      <div className="flex">
        <div className="flex-shrink-0 mr-4">
          <div className={`w-10 h-10 ${getIconBgForType(notification.type)} rounded-full flex items-center justify-center`}>
            <i className={`${getIconForType(notification.type)} ${getIconColorForType(notification.type)}`}></i>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-neutral-900">{notification.title}</h3>
          <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-neutral-500">{timeSince}</span>
            {notification.relatedOrderId && (
              <Link 
                href={`/orders/${notification.relatedOrderId}`}
                className="text-primary-500 hover:text-primary-600 text-sm font-medium transition-colors"
              >
                View Order
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
