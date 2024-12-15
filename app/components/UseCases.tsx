import { Network, Cpu, ShieldCheck } from "lucide-react";

interface UseCasesProps {
  readonly backgroundColor: string;
}

export default function UseCases({ backgroundColor }: UseCasesProps) {
  const cases = [
    {
      icon: Network,
      title: "Remote Branch Connectivity",
      description:
        "Enable distributed offices to securely access centralized resources and systems.",
      example:
        "A multinational company uses RealSync to connect its offices worldwide, ensuring secure and efficient access to databases and management tools.",
    },
    {
      icon: Cpu,
      title: "Business Automation",
      description:
        "Seamlessly integrate cloud services with physical devices like printers or PLCs.",
      example:
        "A factory leverages RealSync to connect cloud-based production systems with on-site PLCs, achieving real-time monitoring and enhanced automation.",
    },
    {
      icon: ShieldCheck,
      title: "Critical Redundancy",
      description:
        "Guarantee uninterrupted availability of mission-critical services.",
      example:
        "A financial institution ensures its trading platforms remain operational 24/7, using RealSync to redirect traffic to backup servers during outages.",
    },
  ];

  return (
    <section className={`py-20 px-6 lg:px-16 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          RealSync in Action: Use Cases
        </h2>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((useCase) => (
            <div
              key={useCase.title}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                  <useCase.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {useCase.description}
                </p>
              </div>
              <div className="bg-gray-100 p-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">
                  Application Example:
                </h4>
                <p className="text-gray-600 leading-relaxed">{useCase.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
