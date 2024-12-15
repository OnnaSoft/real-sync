import { Route, Shield, Cloud, Zap, Settings, Globe } from "lucide-react";

interface MainFeaturesProps {
  readonly backgroundColor: string;
}

export default function MainFeatures({ backgroundColor }: MainFeaturesProps) {
  const features = [
    {
      icon: Route,
      title: "Dynamic Routing",
      description:
        "Efficiently distribute traffic across multiple servers to ensure optimal performance and balance.",
    },
    {
      icon: Shield,
      title: "Automated Failover",
      description:
        "Maintain service continuity with intelligent rerouting in the event of server downtime.",
    },
    {
      icon: Cloud,
      title: "Seamless Hybrid Connectivity",
      description:
        "Bridge the gap between local devices and cloud infrastructures for unified operations.",
    },
    {
      icon: Settings,
      title: "Streamlined Configuration",
      description:
        "Simplify setup with intuitive tools designed for fast and hassle-free implementation.",
    },
    {
      icon: Zap,
      title: "Advanced Security",
      description:
        "Leverage secure tunnels and obfuscation techniques to protect sensitive data and communications.",
    },
    {
      icon: Globe,
      title: "Global Scalability",
      description:
        "Expand your reach with infrastructure built to support worldwide operations and growth.",
    },
  ];

  return (
    <section className={`py-20 px-6 lg:px-16 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Explore the Main Features of RealSync
        </h2>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl shadow-lg p-8 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 rounded-full p-4 mb-6">
                  <feature.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-800 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
