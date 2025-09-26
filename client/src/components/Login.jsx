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
    // Send API request for login
    const res = await api.post('/auth/login', { email, password });

    // Assuming the API returns a token and user data upon successful login
    const { token, user } = res.data; // Adjust based on your API response structure

    // Store the token (you can also store user data in localStorage if needed)
    localStorage.setItem('token', token);
    // If you are using a context to manage user state, call the login function here
    await login(user,token); // Store user information in context

    toast.success("Login successful");

    // Navigate to the dashboard after successful login
    navigate('/dashboard');
    window.location.reload(); 
  } catch (error) {
    // Handle specific error based on status code
    if (error.response) {
      // Specific error message based on status code
      if (error.response.status === 401) {
        toast.error("Invalid credentials. Please try again.");
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
