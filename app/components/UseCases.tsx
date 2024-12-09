import { Network, Cpu, ShieldCheck } from 'lucide-react';

export default function UseCases() {
  const cases = [
    {
      icon: Network,
      title: "Remote Branch Connectivity",
      description: "Secure access to local resources from distributed offices.",
      example: "A multinational company uses Real Sync to connect its offices across different countries, enabling fast and secure access to centralized databases and management systems."
    },
    {
      icon: Cpu,
      title: "Business Automation",
      description: "Integration of cloud systems with physical devices such as printers or PLCs.",
      example: "A factory implements Real Sync to connect its cloud-based production control systems with PLCs on the shop floor, achieving real-time monitoring and increased operational efficiency."
    },
    {
      icon: ShieldCheck,
      title: "Critical Redundancy",
      description: "Ensures continuous availability of essential services.",
      example: "A financial service provider uses Real Sync to ensure its trading platforms remain operational 24/7, automatically redirecting traffic to backup servers in case of failures."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-clip-text">
          Use Cases
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {cases.map((useCase) => (
            <div key={useCase.title} className="bg-white rounded-lg shadow-lg overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                  <useCase.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">{useCase.title}</h3>
                <p className="text-gray-600 text-center mb-6 px-4 leading-relaxed">{useCase.description}</p>
              </div>
              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Application Example:</h4>
                <p className="text-gray-600 leading-relaxed">{useCase.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
