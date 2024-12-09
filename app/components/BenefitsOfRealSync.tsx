import { TrendingUp, Code, Building, Check } from 'lucide-react';

export default function BenefitsOfRealSync() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "For CTOs and IT Managers",
      items: [
        "Enhanced infrastructure scalability",
        "Significant reduction in operational costs",
        "Ensured high availability of services"
      ]
    },
    {
      icon: Code,
      title: "For Developers",
      items: [
        "Quick and easy setup",
        "Compatibility with industry-standard tools",
        "Reduced implementation time"
      ]
    },
    {
      icon: Building,
      title: "For Businesses",
      items: [
        "Improved end-user experience",
        "Robust protection of sensitive data",
        "Increased operational efficiency"
      ]
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-clip-text">
          Benefits of Using Real Sync
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="bg-gray-50 rounded-lg shadow-lg overflow-hidden transition duration-300 ease-in-out hover:shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">{benefit.title}</h3>
                <ul className="space-y-4">
                  {benefit.items.map((item) => (
                    <li key={item} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 leading-tight">{item}</span>
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
