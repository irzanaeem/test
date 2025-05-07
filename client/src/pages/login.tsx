import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/auth-forms";

const Login = () => {
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
        <title>Sign in - MediFind</title>
        <meta name="description" content="Sign in to your MediFind account to order medications from local pharmacies and manage your prescriptions." />
      </Helmet>
      
      <div className="pt-10 pb-20 min-h-screen flex items-center bg-neutral-50">
        <LoginForm />
      </div>
    </>
  );
};

export default Login;
