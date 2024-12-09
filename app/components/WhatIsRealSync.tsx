import { ArrowRight } from 'lucide-react';
import imgSrc from '@/assets/iStock-2155769551.jpg';

export default function WhatIsRealSync() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-clip-text">
          What is Real Sync?
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Real Sync is an innovative traffic and connectivity management solution that goes beyond traditional approaches. Designed for companies aiming to optimize their infrastructure, Real Sync offers seamless integration between local and cloud servers, delivering robust and flexible connectivity.
            </p>
            <ul className="space-y-6">
              {[
                "Seamless connection of local and cloud servers",
                "Intelligent traffic redirection to multiple servers",
                "Fallback capabilities to ensure high availability"
              ].map((point) => (
                <li key={point} className="flex items-start">
                  <ArrowRight className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img
                src={imgSrc}
                alt="Visualization of seamless traffic between servers and devices"
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-blue-600/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
