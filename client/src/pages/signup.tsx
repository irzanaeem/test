import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { SignupForm } from "@/components/auth/auth-forms";

const Signup = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  return (
    <>
      <Helmet>
        <title>Create an Account - MediFind</title>
        <meta name="description" content="Sign up for MediFind to search for medications, check availability, and order directly from local pharmacies near you." />
      </Helmet>
      
      <div className="pt-10 pb-20 min-h-screen flex items-center bg-neutral-50">
        <SignupForm />
      </div>
    </>
  );
};

export default Signup;
