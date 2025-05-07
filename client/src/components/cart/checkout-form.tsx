import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const checkoutSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  pickupTime: z.string().min(1, "Please select a pickup time"),
  paymentMethod: z.enum(["store"]),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormValues) => void;
  isLoading: boolean;
}

const CheckoutForm = ({ onSubmit, isLoading }: CheckoutFormProps) => {
  const { user } = useAuth();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : "",
      phone: user?.phone || "",
      pickupTime: "asap",
      paymentMethod: "store",
      notes: "",
    },
  });
  
  const watchedPickupTime = watch("pickupTime");
  
  const handleFormSubmit = (data: CheckoutFormValues) => {
    onSubmit(data);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-6">
        <h2 className="text-lg font-heading font-semibold text-neutral-900 mb-4">Pickup Details</h2>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="pickupTime">Preferred Pickup Time</Label>
            <Select
              defaultValue="asap"
              onValueChange={(value) => setValue("pickupTime", value)}
            >
              <SelectTrigger className={errors.pickupTime ? "border-red-500" : ""}>
                <SelectValue placeholder="Select pickup time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">As soon as possible</SelectItem>
                <SelectItem value="today-afternoon">Today, 2:00 PM - 4:00 PM</SelectItem>
                <SelectItem value="today-evening">Today, 4:00 PM - 6:00 PM</SelectItem>
                <SelectItem value="today-night">Today, 6:00 PM - 8:00 PM</SelectItem>
                <SelectItem value="tomorrow-morning">Tomorrow, 10:00 AM - 12:00 PM</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" {...register("pickupTime")} value={watchedPickupTime} />
            {errors.pickupTime && (
              <p className="mt-1 text-sm text-red-500">{errors.pickupTime.message}</p>
            )}
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Payment Method</Label>
            <RadioGroup defaultValue="store" onValueChange={(value) => setValue("paymentMethod", value as "store")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="store" id="payment-store" />
                <Label htmlFor="payment-store">Pay at Pharmacy</Label>
              </div>
            </RadioGroup>
            <input type="hidden" {...register("paymentMethod")} value="store" />
          </div>
          
          <div>
            <Label htmlFor="notes">Order Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions..."
              {...register("notes")}
              className="min-h-[100px]"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                Processing...
              </>
            ) : (
              <>
                <i className="ri-shopping-bag-line mr-2"></i>
                Place Order
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
