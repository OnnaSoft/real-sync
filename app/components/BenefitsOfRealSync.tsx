import { TrendingUp, Check, Rocket, Factory } from "lucide-react";

interface BenefitsOfRealSyncProps {
  readonly backgroundColor: string;
}

export default function BenefitsOfRealSync({
  backgroundColor,
}: BenefitsOfRealSyncProps) {
  const benefits = [
    {
      icon: Rocket,
      title: "For Startups and Entrepreneurs",
      items: [
        "Quick deployment to launch your ideas faster",
        "Scalable infrastructure to grow alongside your business",
        "Cost-effective connectivity solutions to maximize resources",
      ],
    },
    {
      icon: Factory,
      title: "For Industries",
      items: [
        "Seamless integration of local and cloud infrastructures",
        "Real-time data exchange with physical devices and sensors",
        "Enhanced operational resilience with intelligent failover",
      ],
    },
    {
      icon: TrendingUp,
      title: "For Enthusiasts",
      items: [
        "Learn and experiment with advanced connectivity tools",
        "Simplify access to powerful traffic management features",
        "Securely test and showcase your local projects online",
      ],
    },
  ];

  return (
    <section className={`py-16 px-6 lg:px-16 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Who Benefits from RealSync?
        </h2>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                  <benefit.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">
                  {benefit.title}
                </h3>
                <ul className="space-y-4">
                  {benefit.items.map((item) => (
                    <li key={item} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 leading-tight">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
