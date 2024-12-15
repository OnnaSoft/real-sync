import { ArrowRight } from "lucide-react";
import imgSrc from "@/assets/iStock-2155560973.jpg";
import { cn } from "~/lib/utils";

interface WhatIsRealSyncProps {
  readonly backgroundColor: string;
}

export default function WhatIsRealSync({ backgroundColor }: WhatIsRealSyncProps) {
  const textColor = "text-gray-800";

  return (
    <section className={cn(`py-20 px-6 lg:px-16`, backgroundColor)}>
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          What is Real Sync?
        </h2>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="order-2 md:order-1">
            <p className="text-lg leading-relaxed mb-8">
              Real Sync is an innovative traffic and connectivity management
              solution that goes beyond traditional approaches. Designed for
              companies aiming to optimize their infrastructure, Real Sync
              offers seamless integration between local and cloud servers,
              delivering robust and flexible connectivity.
            </p>
            <ul className="space-y-6">
              {[
                "Seamless connection of local and cloud servers",
                "Intelligent traffic redirection to multiple servers",
                "Fallback capabilities to ensure high availability",
              ].map((point) => (
                <li key={point} className="flex items-start">
                  <ArrowRight
                    className={`h-6 w-6 ${
                      backgroundColor === "bg-gray-50"
                        ? "text-blue-600"
                        : "text-blue-300"
                    } mr-3 flex-shrink-0`}
                  />
                  <span className="text-gray-800">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Content */}
          <div className="order-1 md:order-2">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={imgSrc}
                alt="Visualization of seamless traffic between servers and devices"
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-800/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
