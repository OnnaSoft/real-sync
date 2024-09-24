import React, { useState } from "react";
import { Form, Link, useNavigate } from "@remix-run/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

type LoginData = {
  username: string;
  password: string;
};

type FormErrors = {
  username?: string;
  password?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const mutation = useMutation<{ success: boolean }, Error, LoginData>({
    mutationFn: (loginData) => {
      return fetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.message || "Login failed");
          });
        }
        return res.json();
      });
    },
    onSuccess: () => {
      navigate("/dashboard"); // Redirect to dashboard on successful login
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const errors: FormErrors = {};
    if (!username) errors.username = "Username is required";
    if (!password) errors.password = "Password is required";

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      mutation.mutate({ username, password });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Log in to RealSync
          </h1>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <Form onSubmit={handleSubmit} className="space-y-4">
              {mutation.isError && (
                <div
                  className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
                  role="alert"
                >
                  <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
                  <span className="sr-only">Error:</span>
                  <div>
                    <span className="font-medium">Error:</span>{" "}
                    {mutation.error.message}
                  </div>
                </div>
              )}
              {mutation.isSuccess && (
                <div
                  className="flex items-center p-4 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50"
                  role="alert"
                >
                  <span className="font-medium">Success:</span> You have
                  successfully logged in.
                </div>
              )}
              <div>
                <Label htmlFor="username">Username or email</Label>
                <Input type="text" id="username" name="username" />
                {formErrors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.username}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input type="password" id="password" name="password" />
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Logging in..." : "Log in"}
              </Button>
            </Form>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
