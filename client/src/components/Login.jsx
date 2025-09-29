import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

export function LoginForm({ className, ...props }) {
  const { login } = useAuth();  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    // Use the login function from AuthContext
    await login(email, password);

    toast.success("Login successful");

    // Navigate to the dashboard after successful login
    navigate('/dashboard');
  } catch (error) {
    // Handle specific error based on status code
    if (error.response) {
      // Specific error message based on status code
      if (error.response.status === 401) {
        toast.error("Invalid credentials. Please try again.");
      } else if (error.response.status === 404) {
        toast.error("User not found. Please check your email.");
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    } else {
      toast.error("Network error. Please check your internet connection.");
    }
  }
};


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-white border border-green-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-green-700">Login to your account</CardTitle>
          <CardDescription className="text-green-500">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email" className="text-green-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                  className="border-green-300 focus-visible:ring-green-500"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-green-700">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm text-green-600 underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-green-300 focus-visible:ring-green-500"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-green-600 text-white hover:bg-green-500"
                >
                  Login
                </Button>
              </div>
            </div>

            {/* Test Credentials */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">Test Credentials:</p>
              <div className="text-xs text-green-700 space-y-1">
                <p><strong>Email:</strong> test@omnibiz.com</p>
                <p><strong>Password:</strong> password123</p>
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs border-green-300 text-green-700 hover:bg-green-100"
                  onClick={() => {
                    setEmail('test@omnibiz.com');
                    setPassword('password123');
                  }}
                >
                  Use Test Credentials
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-green-700">
              Don’t have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4 text-green-600 hover:text-green-700">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
