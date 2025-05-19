import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const ProfilePage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return (
      <div className="container-custom py-10 text-center">
        <h1 className="text-2xl font-heading font-bold mb-4">Not Logged In</h1>
        <p className="text-neutral-600 mb-6">You must be logged in to view your profile.</p>
        <button
          onClick={() => setLocation("/auth")}
          className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-6 rounded-md font-medium"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white border border-blue-200 rounded-2xl shadow-lg p-10 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-blue-900 text-center">Your Profile</h2>
        <div className="mb-4">
          <span className="block text-blue-800 font-semibold">Name</span>
          <span className="block text-blue-900 text-lg">{`${user.firstName || ""} ${user.lastName || ""}`.trim() || "-"}</span>
        </div>
        <div className="mb-4">
          <span className="block text-blue-800 font-semibold">Email</span>
          <span className="block text-blue-900 text-lg">{user.email || "-"}</span>
        </div>
        {user.city && (
          <div>
            <span className="block text-blue-800 font-semibold">City</span>
            <span className="block text-blue-900 text-lg">{user.city}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 