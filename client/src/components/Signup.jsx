import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {Link} from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Signup({ className, ...props }) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-white border border-green-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-green-700">Create your account</CardTitle>
          <CardDescription className="text-green-500">
            Enter your details below to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name" className="text-green-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
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
                  placeholder="you@example.com"
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
                  required
                  className="border-green-300 focus-visible:ring-green-500"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirm-password" className="text-green-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  className="border-green-300 focus-visible:ring-green-500"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-green-600 text-white hover:bg-green-500"
                >
                  Sign Up
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
