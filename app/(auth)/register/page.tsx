import { RegisterForm } from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Create Account
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Sign up to start using the application
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
} 