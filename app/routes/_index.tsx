import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Plans from "@/components/Plans";
import Hero from "~/components/Hero";
import WhatIsRealSync from "~/components/WhatIsRealSync";
import CoreBenefits from "~/components/CoreBenefits";
import UseCases from "~/components/UseCases";
import BenefitsOfRealSync from "~/components/BenefitsOfRealSync";
import TestimonialsAndCaseStudies from "~/components/TestimonialsAndCaseStudies";
import ComparisonTable from "~/components/ComparisonTable";
import FrequentlyAskedQuestions from "~/components/FrequentlyAskedQuestions";
import { useLoaderData } from "@remix-run/react";
import { ColorManager } from "~/lib/colors";
import { useMemo } from "react";

type LoaderData = {
  discoverUrl: string;
  onnasoftUrl: string;
}

export const loader = () => {
  return Response.json({
    discoverUrl: process.env.DISCOVER_URL ?? "",
    onnasoftUrl: process.env.ONNASOFT_URL ?? "",
  } satisfies LoaderData) as any as LoaderData;
}

export default function IndexPage() {
  const { discoverUrl, onnasoftUrl } = useLoaderData<LoaderData>();
  const colorManager = useMemo(() => new ColorManager(), []);
  colorManager.setGray(true);
  const getNextColor = () => colorManager.getNextColor();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <Hero discoverUrl={discoverUrl} />

        <WhatIsRealSync backgroundColor={getNextColor()} />

        <UseCases backgroundColor={getNextColor()} />

        <CoreBenefits backgroundColor={getNextColor()} />

        <BenefitsOfRealSync backgroundColor={getNextColor()} />

        <TestimonialsAndCaseStudies backgroundColor={getNextColor()} />

        <ComparisonTable backgroundColor={getNextColor()} />

        <Plans backgroundColor={getNextColor()} />

        <FrequentlyAskedQuestions backgroundColor={getNextColor()} />

      </main>

      <Footer onnasoftUrl={onnasoftUrl} />
    </div>
  );
}
