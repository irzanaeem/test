import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(dateObj);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function calculateTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export const generateOrderNumber = (id: number): string => {
  return `ORD${String(id).padStart(5, '0')}`;
};

export function getStockStatus(
  quantity: number,
  inStock: boolean
): { label: string; className: string; icon: string } {
  if (!inStock || quantity === 0) {
    return {
      label: 'Out of Stock',
      className: 'text-red-500',
      icon: 'ri-close-circle-line',
    };
  }
  
  if (quantity <= 10) {
    return {
      label: 'Low Stock',
      className: 'text-orange-500',
      icon: 'ri-error-warning-line',
    };
  }
  
  return {
    label: 'In Stock',
    className: 'text-green-600',
    icon: 'ri-checkbox-circle-line',
  };
}

export const getDistanceLabel = (distance: number | undefined): string => {
  if (distance === undefined || distance === null) {
    return "Distance unknown";
  }
  return `${distance.toFixed(1)} miles`;
};

export const getOpenStatus = (
  openingHours: string
): { isOpen: boolean; label: string; className: string } => {
  // This is a simplified version for demonstration
  // In a real app, you would parse the opening hours and check against current time
  const isOpen = Math.random() > 0.2; // Randomly determine if open for demo
  
  return isOpen
    ? { isOpen: true, label: 'Open', className: 'text-green-500' }
    : { isOpen: false, label: 'Closed', className: 'text-red-500' };
};
