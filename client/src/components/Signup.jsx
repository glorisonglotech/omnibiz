import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Signup({ className, ...props }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    businessName: "",
    role: "client", // default role
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  
  // Calculate password strength
  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 15;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 20;
    if (/\d/.test(pwd)) strength += 20;
    if (/[^a-zA-Z\d]/.test(pwd)) strength += 20;
    return Math.min(strength, 100);
  };

  const handleChange = (e) => {
    const { id, value, name } = e.target;
    const field = name || id;
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Update password strength
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");


    const { name, email, password, confirmPassword, phone, businessName, role } = formData;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !businessName ||
      !role
    ) {
      setError("All fields are required.");
      toast.error("All fields are required.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        phone,
        businessName,
        role,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Signup successful! Redirecting...");
      navigate("/dashboard");
      window.location.reload(); 
    } catch (error) {
      const message =
        error.response?.data?.message || "Signup failed. Try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("relative", className)} {...props}>
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Logo/Brand */}
      <div className="text-center mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold text-primary">
            OmniBiz
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">Business Management Platform</p>
      </div>
      
      <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Create Account
          </CardTitle>
          <CardDescription className="text-base">
            Join OmniBiz and start managing your business efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {/* Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="pl-10 h-10 allow-select"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="pl-10 h-10 allow-select"
                  />
                </div>
              </div>

              {/* Grid for Phone and Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Field */}
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+254 700 000 000"
                      required
                      className="pl-10 h-10 allow-select"
                    />
                  </div>
                </div>

                {/* Business Name Field */}
                <div className="grid gap-2">
                  <Label htmlFor="businessName" className="text-sm font-medium">Business Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Your Business"
                      required
                      className="pl-10 h-10 allow-select"
                    />
                  </div>
                </div>
              </div>

              {/* Password Field with Strength Indicator */}
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 h-10 allow-select"
                    placeholder="Min. 8 characters"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={cn("font-medium", 
                        passwordStrength < 40 ? "text-red-500" : 
                        passwordStrength < 70 ? "text-yellow-500" : "text-green-500"
                      )}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className={cn("h-1.5", getPasswordStrengthColor())} />
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 h-10 allow-select"
                    placeholder="Re-enter password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Passwords match
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-sm font-medium">Account Type</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl group mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link
                to="/loginpage"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
