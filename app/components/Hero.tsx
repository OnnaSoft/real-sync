import { Link } from "@remix-run/react";
import { ArrowRight } from 'lucide-react';
import imgSrc from '~/assets/iStock-1341712012-removebg-preview.png';

interface HeroProps {
  readonly discoverUrl: string;
  readonly onnasoftContactUrl: string;
}

export default function Hero({ discoverUrl, onnasoftContactUrl }: HeroProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
          <div className="lg:max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              Connect, Protect, and Scale: The Ultimate Connectivity Solution
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 font-medium">
              Real Sync redefines traffic management and connectivity, taking your infrastructure beyond the cloud.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to={discoverUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300 w-full sm:w-auto"
                aria-label="Learn more about Real Sync"
              >
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to={onnasoftContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300 w-full sm:w-auto"
                aria-label="Request a Real Sync demo"
              >
                Request a Demo
              </Link>
            </div>
          </div>
          <div className="mt-10 lg:mt-0 lg:ml-10">
            <img
              src={imgSrc}
              alt="Visualization of seamless traffic between servers and devices"
              className="w-full max-w-md mx-auto transform transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
