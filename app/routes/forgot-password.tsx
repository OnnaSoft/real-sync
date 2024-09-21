import React from "react";
import { Form, useActionData, Link } from "@remix-run/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AlertCircle } from "lucide-react";
import { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  // Here you would typically send a password reset email
  // For this example, we'll just return a success message if the email is provided
  if (!email) {
    return { error: "El correo electrónico es requerido" };
  }

  // Simulate sending password reset email
  return { success: true };
};

interface ActionData {
  error?: string;
  success?: boolean;
}

export default function ForgotPasswordPage() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Recuperar Contraseña</h1>
          
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
                  <span className="font-medium">Éxito:</span> Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.
                </div>
              )}
              <p className="text-gray-600 mb-4">
                Ingresa tu dirección de correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input type="email" id="email" name="email" required />
              </div>
              <Button type="submit" className="w-full">Enviar instrucciones</Button>
            </Form>
          </div>

          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-gray-600">
              ¿Recordaste tu contraseña? <Link to="/login" className="text-blue-600 hover:underline">Volver al inicio de sesión</Link>
            </p>
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta? <Link to="/register" className="text-blue-600 hover:underline">Regístrate</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}