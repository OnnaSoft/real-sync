import { Form, useActionData, useLoaderData } from "@remix-run/react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Mail, Phone, MapPin } from "lucide-react";
import type { ActionFunction } from "@remix-run/node";

export const loader = async () => {
  const response = {
    title: "Contact Us",
    description: "We'd love to hear from you! Reach out with any questions, feedback, or collaboration ideas.",
    contactEmail: process.env.CONTACT_EMAIL,
    contactWhatsApp: process.env.CONTACT_WHATSAPP,
    contactWhatsappLink: process.env.CONTACT_WHATSAPP_LINK,
    linkedIn: process.env.LINKEDIN_URL,
    github: process.env.GITHUB_URL,
    business: process.env.ONNASOFT_URL,
  };
  return Response.json(response) as any as typeof response;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  if (!name || !email || !message) {
    return { error: "All fields are required" };
  }

  return { success: true };
};

interface ActionData {
  error?: string;
  success?: boolean;
}

export default function ContactPage() {
  const actionData = useActionData<ActionData>();
  const { contactEmail, contactWhatsApp, contactWhatsappLink, linkedIn, github, business } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
            Contact Us
          </h1>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Send us a message
              </h2>
              <Form method="post" className="space-y-6">
                {actionData?.error && (
                  <div className="flex items-center p-4 mb-4 text-sm text-red-700 bg-red-50 border border-red-300 rounded-lg">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {actionData.error}
                  </div>
                )}
                {actionData?.success && (
                  <div className="flex items-center p-4 mb-4 text-sm text-green-700 bg-green-50 border border-green-300 rounded-lg">
                    <span>Your message has been sent successfully!</span>
                  </div>
                )}
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input type="text" id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" name="email" required />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" rows={4} required />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </Form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-primary mr-4" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-primary hover:underline"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-6 h-6 text-primary mr-4" />
                  <div>
                    <h3 className="font-semibold">WhatsApp</h3>
                    <a
                      href={contactWhatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {contactWhatsApp}
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-primary mr-4" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p>Colombia (GMT-5)</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  <a
                    href={linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    GitHub
                  </a>
                  <a
                    href={business}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Website
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer onnasoftUrl={business ?? ""} />
    </div>
  );
}
