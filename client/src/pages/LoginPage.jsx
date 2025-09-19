import React from "react";
import { LoginForm } from "@/components/Login";

function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}

export default LoginPage;
