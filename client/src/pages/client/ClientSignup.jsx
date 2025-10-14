import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Lock, User, Mail, Phone, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Link } from "react-router-dom";

const ClientSignup = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [storeOwner, setStoreOwner] = useState({
    businessName: "Premium Beauty Store",
    ownerName: "Loading...",
  });

  useEffect(() => {
    const fetchStoreOwner = async () => {
      try {
        const response = await api.get(`user/store-owner/${inviteCode}`);
        setStoreOwner({
          businessName: response.data.businessName || "Premium Beauty Store",
          ownerName: response.data.ownerName || "Store Owner",
        });
      } catch (error) {
        toast.error("Failed to load store information.");
        console.error("Error fetching store owner:", error);
        setStoreOwner({
          businessName: "Premium Beauty Store",
          ownerName: "Store Owner",
        });
      }
    };
    fetchStoreOwner();
  }, [inviteCode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      toast.success({
        title: "Welcome!",
        description: `You now have access to ${storeOwner.businessName}`,
      });
      setIsLoading(false);
      navigate(`/client/store/${inviteCode}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">You're Invited!</CardTitle>
            <CardDescription className="mt-2">
              {storeOwner.ownerName} has invited you to shop at{" "}
              <span className="font-semibold text-foreground">{storeOwner.businessName}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+254 712 345 678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                "Creating Account..."
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Join Store
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline flex items-center justify-center gap-1">
                <LogIn className="h-4 w-4" />
                Log in
              </Link>
            </p>
            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                <Lock className="inline h-4 w-4 mr-1" /> Secure & Private • Only {storeOwner.ownerName} can see your orders
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSignup;