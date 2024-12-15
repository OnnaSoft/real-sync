import { useLoaderData } from "@remix-run/react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import Contact from "~/components/Contact";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Contact Us | RealSync",
    },
    {
      property: "og:title",
      content: "Contact Us | RealSync",
    },
    {
      name: "description",
      content:
        "Have questions or need help? Get in touch with the RealSync team. We're here to provide support and answer your queries about seamless connectivity solutions.",
    },
    {
      name: "keywords",
      content:
        "RealSync contact, RealSync support, connectivity solutions inquiries, RealSync customer service, get in touch with RealSync, hybrid network support, cloud integration assistance, business connectivity help, RealSync email support, contact RealSync team, RealSync technical assistance, enterprise connectivity queries, RealSync help desk, secure network integration queries, RealSync feedback and questions",
    },
  ];
};


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

export default function ContactPage() {
  const { business } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-12 md:py-20">
        <Contact />
      </main>

      <Footer onnasoftUrl={business ?? ""} />
    </div>
  );
}
