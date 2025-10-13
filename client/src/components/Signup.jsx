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
import { toast } from "sonner";
import api from "@/lib/api";

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, name } = e.target;
    setFormData((prev) => ({ ...prev, [name || id]: value }));
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
    <div className={className} {...props}>
      <Card className="bg-white border border-green-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-green-700">Create your account</CardTitle>
          <CardDescription className="text-green-500">
            Enter your details below to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name" className="text-green-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border-green-300 focus-visible:ring-green-500"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email" className="text-green-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="border-green-300 focus-visible:ring-green-500"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="phone" className="text-green-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="border-green-300 focus-visible:ring-green-500"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="businessName" className="text-green-700">
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="border-green-300 focus-visible:ring-green-500"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password" className="text-green-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border-green-300 focus-visible:ring-green-500"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword" className="text-green-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="border-green-300 focus-visible:ring-green-500"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="role" className="text-green-700">
                  Select Role
                </Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="border-green-300 focus-visible:ring-green-500 rounded-md p-2"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-green-600 text-white hover:bg-green-500"
                  disabled={loading}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-green-700">
              Already have an account?{" "}
              <Link
                to="/loginpage"
                className="underline underline-offset-4 text-green-600 hover:text-green-700"
              >
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
