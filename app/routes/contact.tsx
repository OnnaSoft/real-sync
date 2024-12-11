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
    description: "Contact us for any question or feedback.",
    contactEmail: process.env.CONTACT_EMAIL,
    contactWhatsApp: process.env.CONTACT_WHATSAPP,
    contactWhatsappLink: process.env.CONTACT_WHATSAPP_LINK,

    linkedIn: process.env.LINKEDIN_URL,
    github: process.env.GITHUB_URL,
    business: process.env.BUSINESS_URL,
  };
  return Response.json(response) as any as typeof response;
}

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
    <div className="flex flex-col min-h-screen ">
      <Header />

      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">Contact Us</h1>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Send us a message</h2>
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
                    <span className="font-medium">Success:</span> Your message has been sent. We will get back to you soon.
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
                <Button type="submit" className="w-full">Send message</Button>
              </Form>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-blue-600 hover:text-blue-800">
                        {contactEmail}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">WhatsApp</h3>
                    <p>
                      <a
                        href={contactWhatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800">
                        {contactWhatsApp}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p>Colombia (GMT-5)</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Follow us</h3>
                <div className="flex space-x-4">
                  <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">LinkedIn</a>
                  <a href={github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">GitHub</a>
                  <a href={business} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Website</a>
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