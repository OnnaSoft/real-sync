import { Route, Shield, Cloud, Zap, Settings } from 'lucide-react';

export default function MainFeatures() {
  const features = [
    {
      icon: Route,
      title: "Enrutamiento Avanzado",
      description: "Redirección dinámica del tráfico a múltiples servidores para optimizar el rendimiento y la distribución de carga."
    },
    {
      icon: Shield,
      title: "Fallback Inteligente",
      description: "Reenvío automático en caso de fallos del servidor, garantizando una alta disponibilidad y continuidad del servicio."
    },
    {
      icon: Cloud,
      title: "Conectividad Híbrida",
      description: "Integración perfecta entre infraestructuras en la nube y dispositivos locales, unificando tu ecosistema tecnológico."
    },
    {
      icon: Settings,
      title: "Fácil Configuración",
      description: "Herramientas intuitivas para una implementación rápida y sencilla, reduciendo el tiempo y la complejidad de la configuración."
    },
    {
      icon: Zap,
      title: "Seguridad Mejorada",
      description: "Ocultación de servicios y túneles seguros para proteger tus datos y comunicaciones sin comprometer el rendimiento."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Características Principales</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="bg-gray-50 rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-xl hover:bg-white"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}