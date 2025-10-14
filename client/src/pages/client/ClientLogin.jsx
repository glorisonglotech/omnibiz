import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const ClientLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Simulated store owner info (will be fetched from backend)
  const storeOwner = {
    businessName: "Premium Beauty Store",
    ownerName: "Sarah Johnson",
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login (will be replaced with actual backend call)
    setTimeout(() => {
      toast.success({
        title: "Welcome Back! 🎉",
        description: `Successfully logged into ${storeOwner.businessName}`,
      });
      setIsLoading(false);
      // Redirect to client storefront (assuming similar routing structure)
      navigate(`/client/store`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-green-500/20">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome Back! 🔒</CardTitle>
            <CardDescription className="mt-2">
              Log in to access{" "}
              <span className="font-semibold text-green-600">{storeOwner.businessName}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                "Logging In..."
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Log In
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Don't have an account?{" "}
              <a href="/signup" className="text-green-500 hover:underline">
                Sign Up
              </a>
            </p>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                🔒 Secure Login • Your data is protected
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;