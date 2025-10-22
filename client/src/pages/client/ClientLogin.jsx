import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const ClientLogin = () => {
  const navigate = useNavigate();
  const { inviteCode } = useParams();
  const { login, customer, isAuthenticated, loading } = useCustomerAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redirect if already logged in (only after loading completes)
  useEffect(() => {
    if (!loading && isAuthenticated && customer) {
      console.log('✅ Already logged in, redirecting to storefront');
      const targetUrl = inviteCode ? `/client/store/${inviteCode}` : '/client/store';
      navigate(targetUrl, { replace: true });
    }
  }, [loading, isAuthenticated, customer, inviteCode, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login...');
      const result = await login(formData);
      
      if (result.success) {
        console.log('✅ Login successful, customer:', result.customer?.email);
        console.log('✅ Token saved to localStorage');
        toast.success(`Welcome Back ${result.customer?.name || ''}!`);
        
        // Wait for state to fully update before navigating
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const targetUrl = inviteCode ? `/client/store/${inviteCode}` : '/client/store';
        console.log('🔄 Navigating to:', targetUrl);
        navigate(targetUrl, { replace: true });
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome Back! 🔒</CardTitle>
            <CardDescription className="mt-2">
              Log in to continue shopping
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
                  className="pl-10"
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
                "Logging In..."
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Log In
                </>
              )}
            </Button>

            <div className="text-xs text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                to={`/client/signup/${inviteCode}`} 
                className="text-primary hover:underline inline-flex items-center gap-1 ml-1"
              >
                <UserPlus className="h-3 w-3" />
                Sign Up
              </Link>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                <Lock className="inline h-3 w-3 mr-1" /> Secure Login • Your data is protected
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;