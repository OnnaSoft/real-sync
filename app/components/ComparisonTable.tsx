import { Check, X, Info } from 'lucide-react';

export default function ComparisonTable() {
  const features = [
    "Conexión segura entre redes híbridas",
    "Balanceo de carga",
    "Optimización dinámica de rutas de tráfico",
    "Integración nube-local",
    "Configuración intuitiva por interfaz",
    "Escalabilidad automática",
    "Fallback automático",
    "Protección avanzada de servicios",
    "Rendimiento optimizado",
    "Costos de implementación"
  ];

  const solutions = [
    { name: "Real Sync", features: [true, true, true, true, true, true, true, true, true, "Bajo"] },
    { name: "VPNs", features: [true, false, false, false, false, false, false, false, false, "Alto"] },
    { name: "Load Balancers Tradicionales", features: [false, true, false, false, false, true, true, false, true, "Medio"] },
    { name: "API Gateways Limitados", features: [false, true, true, false, false, false, false, true, false, "Medio"] }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Comparativa con Soluciones Tradicionales</h2>
        <div className="overflow-x-auto shadow-xl rounded-lg">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border-b border-blue-500 p-3 text-left">Características</th>
                {solutions.map((solution, index) => (
                  <th key={index} className="border-b border-blue-500 p-3 text-center">{solution.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, featureIndex) => (
                <tr key={feature} className={featureIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border-b border-gray-200 p-3">{feature}</td>
                  {solutions.map((solution, solutionIndex) => (
                    <td key={solution.name} className="border-b border-gray-200 p-3 text-center">
                      {typeof solution.features[featureIndex] === 'boolean' ? (
                        solution.features[featureIndex] ? (
                          <Check className="inline-block text-green-500 h-5 w-5" />
                        ) : (
                          <X className="inline-block text-red-500 h-5 w-5" />
                        )
                      ) : (
                        <span
                          className={`font-semibold ${
                            solution.features[featureIndex] === "Bajo"
                              ? "text-green-500"
                              : solution.features[featureIndex] === "Medio"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        >
                          {solution.features[featureIndex]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 bg-gray-100 rounded-lg p-4 flex items-start space-x-4">
          <Info className="text-blue-600 h-6 w-6 flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm text-gray-700 mb-2">
              <Check className="inline-block text-green-500 h-5 w-5 mr-1" /> 
              Indica que la característica está disponible.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <X className="inline-block text-red-500 h-5 w-5 mr-1" /> 
              Indica que la característica no está disponible.
            </p>
            <p className="text-sm text-gray-700">
              Esta tabla comparativa muestra cómo Real Sync se destaca frente a soluciones tradicionales en diversos aspectos clave de conectividad y gestión de tráfico.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}