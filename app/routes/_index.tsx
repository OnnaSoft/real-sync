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
import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Seamless Connectivity Solutions | RealSync",
    },
    {
      property: "og:title",
      content: "Seamless Connectivity Solutions | RealSync",
    },
    {
      name: "description",
      content:
        "RealSync revolutionizes connectivity and traffic management with cutting-edge solutions for businesses of all sizes. Connect, protect, and scale effortlessly.",
    },
    {
      name: "keywords",
      content:
        "RealSync connectivity solutions, hybrid network integration, cloud-local server connection, secure tunnels for data protection, fallback solutions for high availability, intelligent traffic routing, scalable connectivity platforms, VPN alternative for businesses, dynamic traffic management, connectivity for fintech, manufacturing connectivity solutions, secure cloud computing, enterprise traffic management, business automation tools, low-latency connectivity, seamless branch office integration, IT infrastructure optimization, network redundancy solutions, modern connectivity tools",
    },
  ];
};

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
