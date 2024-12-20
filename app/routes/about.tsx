import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AboutHero from "~/components/AboutHero";
import OurStory from "~/components/OurStory";
import MissionVisionValues from "~/components/MissionVisionValues";
import OurApproach from "~/components/OurApproach";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow">
        <AboutHero />

        <OurStory />

        <MissionVisionValues />

        <OurApproach />
      </main>

      <Footer />
    </div>
  );
}