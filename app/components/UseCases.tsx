import { Network, Cpu, ShieldCheck } from 'lucide-react';

export default function UseCases() {
  const cases = [
    {
      icon: Network,
      title: "Conexión de Sucursales Remotas",
      description: "Acceso seguro a recursos locales desde oficinas distribuidas.",
      example: "Una empresa multinacional utiliza Real Sync para conectar sus oficinas en diferentes países, permitiendo un acceso rápido y seguro a bases de datos centralizadas y sistemas de gestión."
    },
    {
      icon: Cpu,
      title: "Automatización Empresarial",
      description: "Integración de sistemas en la nube con dispositivos físicos como impresoras o PLCs.",
      example: "Una fábrica implementa Real Sync para conectar sus sistemas de control de producción basados en la nube con los PLCs en el piso de fabricación, logrando una supervisión en tiempo real y una mayor eficiencia operativa."
    },
    {
      icon: ShieldCheck,
      title: "Redundancia Crítica",
      description: "Asegura disponibilidad continua en servicios esenciales.",
      example: "Un proveedor de servicios financieros utiliza Real Sync para garantizar que sus plataformas de trading permanezcan operativas 24/7, redirigiendo automáticamente el tráfico a servidores de respaldo en caso de fallos."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Casos de Uso</h2>
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
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Ejemplo de Aplicación:</h4>
                <p className="text text-gray-600 leading-relaxed">{useCase.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}