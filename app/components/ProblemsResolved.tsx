import { Server, Cloud, Lock } from 'lucide-react';

export default function ProblemsResolved() {
  const problems = [
    {
      icon: Server,
      title: "Downtime y fallos en servidores",
      description: "Evita interrupciones en el servicio y mantén tu negocio en funcionamiento continuo."
    },
    {
      icon: Cloud,
      title: "Integración compleja de infraestructuras híbridas",
      description: "Simplifica la conexión entre tus sistemas locales y en la nube."
    },
    {
      icon: Lock,
      title: "Dependencia de VPNs para conectividad segura",
      description: "Obtén una conectividad segura sin la complejidad de las VPNs tradicionales."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Problemas que Real Sync Resuelve</h2>
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