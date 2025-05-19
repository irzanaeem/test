import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { pakistanCities } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Add this style block at the top level of the file (after imports) for input styling if not already present in your global CSS
// If you have a global CSS file, add these classes there instead

const CreatePharmacy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    name: "",
    address: user?.address || "",
    city: user?.city || "",
    zipCode: "",
    phone: user?.phone || "",
    email: user?.email || "",
    openingHours: "Monday-Saturday: 9am-9pm, Sunday: 10am-6pm",
    description: "",
    image: null as File | null,
  });

  const createPharmacyMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "image" && value) {
          formData.append("image", value as File);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      console.log("Sending FormData to /api/stores:", Array.from(formData.entries()));
      const response = await apiRequest("POST", "/api/stores", formData, true);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Pharmacy Created", description: "Your pharmacy has been created.", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stores/user"] });
      navigate("/store-dashboard");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: `Failed to create pharmacy: ${error.message}`, variant: "destructive" });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting pharmacy form with data:", form);
    createPharmacyMutation.mutate(form);
  };

  if (!user?.isStore) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>Not Authorized</h1>
        <p>You must be registered as a pharmacy store owner to access this page.</p>
        <button onClick={() => navigate("/")}>Go to Home Page</button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-10" style={{ background: 'linear-gradient(135deg, #a5b4fc 0%, #67e8f9 100%)' }}>
      <Card className="w-full max-w-lg bg-white text-black shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Create Your Pharmacy</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Pharmacy Name<span className="text-red-500">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} required className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address<span className="text-red-500">*</span></label>
              <input name="address" value={form.address} onChange={handleChange} required className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City<span className="text-red-500">*</span></label>
              <select name="city" value={form.city} onChange={handleChange} required className="input w-full">
                <option value="">Select city</option>
                {pakistanCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zip Code<span className="text-red-500">*</span></label>
              <input name="zipCode" value={form.zipCode} onChange={handleChange} required className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number<span className="text-red-500">*</span></label>
              <input name="phone" value={form.phone} onChange={handleChange} required className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email<span className="text-red-500">*</span></label>
              <input name="email" value={form.email} onChange={handleChange} required className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Opening Hours<span className="text-red-500">*</span></label>
              <input name="openingHours" value={form.openingHours} onChange={handleChange} required className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pharmacy Description<span className="text-red-500">*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange} required className="input w-full min-h-[80px]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pharmacy Image</label>
              <input name="image" type="file" accept="image/*" onChange={handleChange} className="input w-full" />
            </div>
            <Button type="submit" className="w-full" disabled={createPharmacyMutation.isPending}>
              {createPharmacyMutation.isPending ? "Creating..." : "Create Pharmacy"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePharmacy;