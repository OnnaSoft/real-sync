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
