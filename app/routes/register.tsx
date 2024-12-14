import React, { useState } from "react";
import { Form, Link, useNavigate } from "@remix-run/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { HttpErrors } from "@/models/errors";
import useFetch from "~/hooks/useFetch";

type RegisterData = {
  fullname: string;
  username: string;
  email: string;
  password: string;
};

type FormErrors = {
  fullname?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  [key: string]: string | undefined;
};

export default function RegisterPage() {
  const fetch = useFetch();
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const mutation = useMutation<{ success: boolean }, Error, RegisterData>({
    mutationFn: (newUser) => {
      return fetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((data: HttpErrors) => {
            if (data.errors) {
              const errors: FormErrors = {};
              for (const error of Object.entries(data.errors)) {
                const key = error[0];
                errors[key] = error[1]?.message;
              }
              setFormErrors(errors);
            }

            throw new Error(data.message ?? data.errors.server?.message ?? "Registration failed");
          });
        }
        return res.json();
      });
    },
    onSuccess: () => {
      navigate("/login");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullname = formData.get("fullname") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const acceptTerms = formData.get("acceptTerms");

    const errors: FormErrors = {};

    if (!fullname) errors.fullname = "Full name is required";
    if (!username) errors.username = "Username is required";
    if (!email) errors.email = "Email address is required";
    if (!password) errors.password = "Password is required";
    if (!confirmPassword)
      errors.confirmPassword = "Please confirm your password";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    if (!acceptTerms)
      errors.acceptTerms = "You must accept the terms and conditions";

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      mutation.mutate({ fullname, username, email, password });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Register for RealSync
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
                  <span className="font-medium">Success:</span> Your account has
                  been created. Please log in.
                </div>
              )}
              <div>
                <Label htmlFor="fullname">Full name</Label>
                <Input type="text" id="fullname" name="fullname" />
                {formErrors.fullname && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.fullname}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input type="text" id="username" name="username" />
                {formErrors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.username}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input type="email" id="email" name="email" />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.email}
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
              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="acceptTerms" name="acceptTerms" />
                <Label htmlFor="acceptTerms" className="text-sm">
                  I accept the{" "}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    terms and conditions
                  </Link>
                </Label>
              </div>
              {formErrors.acceptTerms && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.acceptTerms}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Registering..." : "Register"}
              </Button>
            </Form>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
