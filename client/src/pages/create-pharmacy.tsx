import { useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertStoreSchema, pakistanCities } from "@shared/schema";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Define the form schema based on the insertStoreSchema but with a few adjustments
const createPharmacySchema = insertStoreSchema.extend({
  imageFile: z.instanceof(FileList).optional(),
});

type FormValues = z.infer<typeof createPharmacySchema>;

const CreatePharmacy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(createPharmacySchema),
    defaultValues: {
      name: "",
      address: user?.address || "",
      city: user?.city || "",
      zipCode: "",
      phone: user?.phone || "",
      email: user?.email || "",
      openingHours: "Monday-Saturday: 9am-9pm, Sunday: 10am-6pm",
      description: "",
      // Remove the imageFile from defaultValues as it's handled separately
    },
  });

  const createPharmacyMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const formData = new FormData();
      
      // Add all text fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "imageFile" && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add image file if present
      if (data.imageFile && data.imageFile.length > 0) {
        formData.append("image", data.imageFile[0]);
      }
      
      const response = await apiRequest("POST", "/api/stores", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pharmacy Created",
        description: "Your pharmacy has been created successfully.",
        variant: "default",
      });
      
      // Invalidate stores cache
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stores/user"] });
      
      // Redirect to store dashboard
      navigate("/store-dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create pharmacy: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Update form
      form.setValue("imageFile", files);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = (data: FormValues) => {
    createPharmacyMutation.mutate(data);
  };

  // Redirect if user is not a store owner
  if (!user?.isStore) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-semibold mb-4">Not Authorized</h1>
        <p>You must be registered as a pharmacy store owner to access this page.</p>
        <Button 
          onClick={() => navigate("/")}
          className="mt-4"
        >
          Go to Home Page
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Create Your Pharmacy - E Pharma</title>
        <meta 
          name="description"
          content="Set up your pharmacy store on E Pharma. Fill in your store details and start selling medications to customers in your city."
        />
      </Helmet>

      <div className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create Your Pharmacy</h1>
            <p className="text-neutral-600 mt-2">
              Fill in the details below to set up your pharmacy on E Pharma.
            </p>
          </div>

          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-6 bg-white p-6 rounded-lg shadow-md"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pharmacy Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter pharmacy name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address*</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pakistanCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code*</FormLabel>
                      <FormControl>
                        <Input placeholder="Zip code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="openingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Hours*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Monday-Friday: 9am-7pm, Weekends: 10am-5pm" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify your pharmacy's opening hours
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pharmacy Description*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your pharmacy, services, specialties, etc."
                        className="resize-none min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Pharmacy Image</FormLabel>
                <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-md">
                  {imagePreview ? (
                    <div className="mb-4">
                      <img 
                        src={imagePreview} 
                        alt="Pharmacy preview" 
                        className="w-full max-w-md h-auto rounded"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 text-gray-500">
                      <i className="ri-image-add-line text-3xl mb-2"></i>
                      <p className="text-sm">Upload an image of your pharmacy</p>
                      <p className="text-xs mt-1">Recommended size: 800x600px. Max size: 5MB</p>
                    </div>
                  )}
                  
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-4"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createPharmacyMutation.isPending}
                >
                  {createPharmacyMutation.isPending ? "Creating..." : "Create Pharmacy"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

export default CreatePharmacy;