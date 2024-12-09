import { Server, Cloud, Lock } from 'lucide-react';

export default function ProblemsResolved() {
  const problems = [
    {
      icon: Server,
      title: "Downtime and Server Failures",
      description: "Avoid service interruptions and keep your business running continuously."
    },
    {
      icon: Cloud,
      title: "Complex Hybrid Infrastructure Integration",
      description: "Simplify the connection between your local systems and the cloud."
    },
    {
      icon: Lock,
      title: "Dependence on VPNs for Secure Connectivity",
      description: "Achieve secure connectivity without the complexity of traditional VPNs."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-clip-text">
          Problems Solved by Real Sync
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="bg-white rounded-lg shadow-lg p-6 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 rounded-full p-4 mb-6">
                  <problem.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{problem.title}</h3>
                <p className="text-gray-600 leading-relaxed">{problem.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
