import { TrendingUp, Code, Building, Check } from 'lucide-react';

export default function BenefitsOfRealSync() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Para CTOs y Gerentes de IT",
      items: [
        "Escalabilidad mejorada de la infraestructura",
        "Reducción significativa de costos operativos",
        "Garantía de alta disponibilidad de servicios"
      ]
    },
    {
      icon: Code,
      title: "Para Desarrolladores",
      items: [
        "Configuración sencilla y rápida",
        "Compatibilidad con herramientas estándar de la industria",
        "Reducción del tiempo de implementación"
      ]
    },
    {
      icon: Building,
      title: "Para Empresas",
      items: [
        "Mejora notable en la experiencia del usuario final",
        "Protección robusta de datos sensibles",
        "Aumento de la eficiencia operativa"
      ]
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Beneficios de Usar Real Sync</h2>
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