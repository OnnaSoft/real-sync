import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Form, Link } from "@remix-run/react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ResetPasswordData = {
  token: string;
  newPassword: string;
};

type FormErrors = {
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const mutation = useMutation<{ message: string }, Error, ResetPasswordData>({
    mutationFn: (resetData) => {
      return fetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(resetData),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.message || "Password reset failed");
          });
        }
        return res.json();
      });
    },
    onSuccess: () => {
      navigate("/login", {
        state: {
          message:
            "Password reset successful. You can now log in with your new password.",
        },
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const token = searchParams.get("token") || "";
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const errors: FormErrors = {};
    if (!token) errors.token = "Reset token is missing";
    if (!newPassword) errors.newPassword = "New password is required";
    if (newPassword !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      mutation.mutate({ token, newPassword });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Reset Your Password
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
              {formErrors.token && (
                <div
                  className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
                  role="alert"
                >
                  <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
                  <span className="sr-only">Error:</span>
                  <div>
                    <span className="font-medium">Error:</span>{" "}
                    {formErrors.token}
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input type="password" id="newPassword" name="newPassword" />
                {formErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.newPassword}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? "Resetting Password..."
                  : "Reset Password"}
              </Button>
            </Form>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Remember your password?{" "}
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
