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
      
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #a5b4fc 0%, #67e8f9 100%)' }}
      >
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-5xl flex">
          <LoginForm />
        </div>
      </div>
    </>
  );
};

export default Login;
