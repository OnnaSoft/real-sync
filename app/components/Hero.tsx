import { Link } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import imgSrc from "~/assets/iStock-1341712012-removebg-preview.png";

interface HeroProps {
  readonly discoverUrl: string;
}

export default function Hero({ discoverUrl }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-b bg-white py-20 px-6 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start lg:space-x-16">
        {/* Left Content */}
        <div className="text-center lg:text-left lg:max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-6">
            Connect, Protect, and Scale: The Ultimate Connectivity Solution
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8">
            Real Sync redefines traffic management and connectivity, taking your infrastructure beyond the cloud.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Link
              to={discoverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-primary rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300"
              aria-label="Learn more about Real Sync"
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to={"/contact"}
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-primary bg-white border border-primary rounded-full shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300"
              aria-label="Request a Real Sync demo"
            >
              Request a Demo
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="mt-12 lg:mt-0 lg:flex-shrink-0">
          <img
            src={imgSrc}
            alt="Visualization of seamless traffic between servers and devices"
            className="w-full max-w-lg mx-auto transform transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
}
