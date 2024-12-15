import { ShieldCheck, Globe, Activity, Route, Cloud, Zap } from "lucide-react";

interface CoreBenefitsProps {
  readonly backgroundColor: string;
}

export default function CoreBenefits({ backgroundColor }: CoreBenefitsProps) {
  const benefits = [
    {
      icon: ShieldCheck,
      title: "Enhanced Security",
      description:
        "Protect your systems with advanced traffic encryption and secure routing for every connection.",
    },
    {
      icon: Globe,
      title: "Global Connectivity",
      description:
        "Seamlessly connect your local and remote servers, ensuring low latency and high performance across regions.",
    },
    {
      icon: Activity,
      title: "Optimized Performance",
      description:
        "Intelligently manage traffic to balance loads and ensure system resilience during peak usage.",
    },
    {
      icon: Route,
      title: "Dynamic Routing",
      description:
        "Efficiently distribute traffic across multiple servers to ensure optimal performance and balance.",
    },
    {
      icon: Cloud,
      title: "Hybrid Connectivity",
      description:
        "Bridge the gap between local devices and cloud infrastructures for unified operations.",
    },
    {
      icon: Zap,
      title: "Advanced Security Features",
      description:
        "Leverage secure tunnels and obfuscation techniques to protect sensitive data and communications.",
    },
  ];

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Core Benefits of RealSync
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white cursor-pointer rounded-xl shadow-lg p-8 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`rounded-full p-4 mb-6 ${backgroundColor}`}>
                  <benefit.icon className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  {benefit.title}
                </h3>
                <p className="text-gray-800 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
