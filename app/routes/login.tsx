import React from "react";
import { Form, useActionData, Link } from "@remix-run/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  // Here you would typically validate the credentials and log the user in
  // For this example, we'll just return a success message if both fields are filled
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Simulate successful login
  return { success: true };
};

type ActionData = {
  error?: string;
  success?: boolean;
};

export default function LoginPage() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Log in to RealSync</h1>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <Form method="post" className="space-y-4">
              {actionData?.error && (
                <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50" role="alert">
                  <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
                  <span className="sr-only">Error:</span>
                  <div>
                    <span className="font-medium">Error:</span> {actionData.error}
                  </div>
                </div>
              )}
              {actionData?.success && (
                <div className="flex items-center p-4 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50" role="alert">
                  <span className="font-medium">Success:</span> You have successfully logged in.
                </div>
              )}
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input type="email" id="email" name="email" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input type="password" id="password" name="password" required />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" name="remember" />
                  <Label htmlFor="remember" className="text-sm">Remember me</Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <Button type="submit" className="w-full">Log in</Button>
            </Form>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}