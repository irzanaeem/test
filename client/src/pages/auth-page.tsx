import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { pakistanCities } from "@shared/schema";
import Select from 'react-select';

// Convert readonly array to mutable for zod enum
const cityArray = [...pakistanCities] as [string, ...string[]];

import { Button } from "@/components/ui/button";
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Signup form schema
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.enum(cityArray),
  isStore: z.boolean().optional().default(false),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const cityOptions = pakistanCities.map(city => ({ value: city, label: city }));

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: '#4F6BED',
    boxShadow: state.isFocused ? '0 0 0 2px #4F6BED33' : provided.boxShadow,
    '&:hover': { borderColor: '#4F6BED' },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#4F6BED'
      : state.isFocused
      ? '#4F6BED22'
      : '#fff',
    color: state.isSelected ? '#fff' : '#4F6BED',
    '&:active': { backgroundColor: '#4F6BED' },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#4F6BED',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#4F6BED',
  }),
};

const AuthPage = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
      city: undefined,
      isStore: false,
      agreeToTerms: false,
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Handle signup form submission
  const onSignupSubmit = (data: SignupFormValues) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  return (
    <>
      <Helmet>
        <title>{activeTab === "login" ? "Sign In" : "Create Account"} - E Pharma</title>
        <meta 
          name="description" 
          content="Sign in to E Pharma to find medications, check availability, and order from local pharmacies in Pakistan." 
        />
      </Helmet>
      
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row overflow-hidden rounded-lg shadow-xl bg-white">
            {/* Hero Section - Left on mobile, right on desktop */}
            <div className="md:w-1/2 bg-white text-primary-700 p-8 md:p-12 border-r border-gray-200">
              <div className="h-full flex flex-col justify-center">
                <h1 className="text-4xl font-heading font-bold leading-tight mb-4 text-[#4F6BED]">
                  Find Medications Nearby
                </h1>
                <p className="text-lg mb-8 text-[#4F6BED]">
                  Connect with local pharmacies in your city and find the medications you need, all in one place.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-[#4F6BED] bg-opacity-20 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4F6BED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-[#4F6BED]">Find Local Pharmacies</h3>
                      <p className="text-[#4F6BED] opacity-70">Browse and compare pharmacies in your area</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-[#4F6BED] bg-opacity-20 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4F6BED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-[#4F6BED]">Scan Prescriptions</h3>
                      <p className="text-[#4F6BED] opacity-70">Use our OCR technology to scan your prescription</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-[#4F6BED] bg-opacity-20 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4F6BED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-[#4F6BED]">Easy Ordering</h3>
                      <p className="text-[#4F6BED] opacity-70">Place orders for pickup with just a few clicks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Auth Forms */}
            <div className="md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center">
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-white border border-[#4F6BED] rounded-lg overflow-hidden">
                  <TabsTrigger value="login" className="text-[#4F6BED] data-[state=active]:bg-[#4F6BED]/10 data-[state=active]:text-[#4F6BED]">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="text-[#4F6BED] data-[state=active]:bg-[#4F6BED]/10 data-[state=active]:text-[#4F6BED]">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Card className="bg-white text-[#4F6BED] border border-[#4F6BED]">
                    <CardHeader>
                      <CardTitle className="text-[#4F6BED]">Sign in to your account</CardTitle>
                      <CardDescription className="text-[#4F6BED] opacity-70">Enter your username and password to access your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Enter your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? "Signing in..." : "Sign In"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                      <div className="text-sm text-center text-[#4F6BED] opacity-70">
                        Don't have an account yet?{" "}
                        <button 
                          onClick={() => setActiveTab("signup")}
                          className="text-[#4F6BED] hover:underline font-medium"
                          type="button"
                        >
                          Create an account
                        </button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="signup">
                  <Card className="bg-white text-[#4F6BED] border border-[#4F6BED]">
                    <CardHeader>
                      <CardTitle className="text-[#4F6BED]">Create a new account</CardTitle>
                      <CardDescription className="text-[#4F6BED] opacity-70">Fill in your details to register for E Pharma</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...signupForm}>
                        <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={signupForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="First name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={signupForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={signupForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Choose a username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={signupForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Email address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={signupForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Create a password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={signupForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Confirm password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={signupForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={signupForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="Street address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={signupForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <Controller
                                  name="city"
                                  control={signupForm.control}
                                  render={({ field: { onChange, value, ref } }) => (
                                    <Select
                                      inputRef={ref}
                                      options={cityOptions}
                                      styles={customSelectStyles}
                                      placeholder="Select your city"
                                      value={cityOptions.find(option => option.value === value) || null}
                                      onChange={option => onChange(option ? option.value : null)}
                                      isClearable
                                    />
                                  )}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={signupForm.control}
                            name="isStore"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Register as a Pharmacy Store Owner</FormLabel>
                                  <FormDescription>
                                    Check this box if you want to register as a pharmacy store owner. 
                                    This will allow you to create and manage your store, add medications, 
                                    and fulfill orders.
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={signupForm.control}
                            name="agreeToTerms"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>I agree to the Terms of Service and Privacy Policy</FormLabel>
                                  <FormDescription>
                                    By checking this box, you agree to our{" "}
                                    <a
                                      href="#"
                                      className="text-primary-600 hover:underline"
                                      onClick={(e) => e.preventDefault()}
                                    >
                                      Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a
                                      href="#"
                                      className="text-primary-600 hover:underline"
                                      onClick={(e) => e.preventDefault()}
                                    >
                                      Privacy Policy
                                    </a>
                                    .
                                  </FormDescription>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <div className="text-sm text-center text-[#4F6BED] opacity-70">
                        Already have an account?{" "}
                        <button 
                          onClick={() => setActiveTab("login")}
                          className="text-[#4F6BED] hover:underline font-medium"
                          type="button"
                        >
                          Sign in
                        </button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;