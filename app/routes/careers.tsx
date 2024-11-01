import React from "react";
import { Form, useActionData } from "@remix-run/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Briefcase, Users, Zap } from "lucide-react";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const resume = formData.get("resume");

  // Here you would typically save to a database or send an email
  // For this example, we'll just return a success message
  if (!name || !email || !resume) {
    return { error: "All fields are required" };
  }

  return { success: true };
};

interface ActionData {
  success?: boolean;
  error?: string;
}

export default function CareersPage() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">Careers at RealSync</h1>
          
          <div className="bg-white shadow-lg rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Future Opportunities</h2>
            <p className="text-gray-600 mb-4">
              We are not currently hiring, but we are always looking for exceptional talent to join our team in the future. If you're interested in working with us, we invite you to leave your details for future opportunities.
            </p>
            <p className="text-gray-600 mb-4">
              At RealSync, we value passion for technology, innovation, and teamwork. We are looking for people who share our vision of revolutionizing real-time communication and software development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Leave your details</h2>
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
                    <span className="font-medium">Success:</span> We have received your information. We will contact you when relevant opportunities arise.
                  </div>
                )}
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input type="text" id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input type="email" id="email" name="email" required />
                </div>
                <div>
                  <Label htmlFor="resume">Professional summary</Label>
                  <Textarea id="resume" name="resume" rows={4} required placeholder="Tell us about your experience and skills..." />
                </div>
                <Button type="submit" className="w-full">Submit information</Button>
              </Form>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why RealSync?</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Zap className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Constant Innovation</h3>
                    <p className="text-gray-600">You'll work with the latest technologies and participate in innovative projects.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Collaborative Culture</h3>
                    <p className="text-gray-600">We foster a collaborative and supportive work environment.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Briefcase className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Professional Growth</h3>
                    <p className="text-gray-600">We offer opportunities for continuous learning and development.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}