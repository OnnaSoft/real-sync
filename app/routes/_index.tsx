import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Plans from "@/components/Plans";
import Hero from "~/components/Hero";
import WhatIsRealSync from "~/components/WhatIsRealSync";
import ProblemsResolved from "~/components/ProblemsResolved";
import MainFeatures from "~/components/MainFeatures";
import UseCases from "~/components/UseCases";
import BenefitsOfRealSync from "~/components/BenefitsOfRealSync";
import TestimonialsAndCaseStudies from "~/components/TestimonialsAndCaseStudies";
import ComparisonTable from "~/components/ComparisonTable";
import FrequentlyAskedQuestions from "~/components/FrequentlyAskedQuestions";
import { useLoaderData } from "@remix-run/react";

type LoaderData = {
  discoverUrl: string;
  onnasoftContactUrl: string;
}

export const loader = () => {
  return Response.json({
    discoverUrl: process.env.DISCOVER_URL ?? "",
    onnasoftContactUrl: process.env.ONNASOFT_CONTACT_URL ?? ""
  } satisfies LoaderData) as any as LoaderData;
}

export default function IndexPage() {
  const { discoverUrl, onnasoftContactUrl } = useLoaderData<LoaderData>();
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <Hero discoverUrl={discoverUrl} onnasoftContactUrl={onnasoftContactUrl} />

        <WhatIsRealSync />

        <ProblemsResolved />

        <MainFeatures />

        <UseCases />

        <BenefitsOfRealSync />

        <TestimonialsAndCaseStudies />

        <ComparisonTable />

        <FrequentlyAskedQuestions />

        <Plans />

      </main>

      <Footer />
    </div>
  );
}

interface FeatureCardProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </div>
  );
}

interface UsageCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function UsageCard(props: Readonly<UsageCardProps>) {
  return <FeatureCard {...props} />;
}

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: Readonly<BenefitCardProps>) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </div>
  );
}