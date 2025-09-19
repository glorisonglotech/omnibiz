import React from "react";
import { Signup } from "@/components/Signup";

function SignupPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Signup />
      </div>
    </main>
  );
}

export default SignupPage;
