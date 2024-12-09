import { Building, ShoppingCart, Factory, GraduationCap, CreditCard, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';

const testimonials = [
  {
    icon: Building,
    company: "Global Freight Solutions",
    industry: "Transporte y Logística",
    problem: "Dificultades para sincronizar datos entre servidores locales en diferentes sucursales y aplicaciones basadas en la nube, causando retrasos en actualizaciones y quejas de clientes.",
    solution: "Real Sync conectó servidores locales con herramientas en la nube de forma segura y eficiente, implementando capacidades de fallback para mantener el sistema operativo durante fallos de red.",
    results: [
      "Reducción del tiempo de actualización de datos de 15 minutos a tiempo real.",
      "Aumento del 25% en la satisfacción del cliente.",
      "Menor dependencia de VPNs, ahorrando costos de configuración y mantenimiento."
    ]
  },
  {
    icon: ShoppingCart,
    company: "QuickMart Online",
    industry: "E-commerce",
    problem: "Saturación de servidores locales durante picos de tráfico, causando retrasos en el procesamiento de pedidos.",
    solution: "Real Sync implementó un sistema de balanceo de carga y dominios virtuales exclusivos para acceso seguro sin VPN.",
    results: [
      "Capacidad para manejar hasta un 40% más de tráfico sin interrupciones.",
      "Reducción del tiempo de respuesta del servidor en un 35%.",
      "Incremento en las ventas durante eventos promocionales."
    ]
  },
  {
    icon: Factory,
    company: "Precision Tools Inc.",
    industry: "Manufactura",
    problem: "Necesidad de supervisar y controlar PLCs desde un sistema de gestión basado en la nube sin comprometer la seguridad.",
    solution: "Real Sync conectó PLCs de manera segura al sistema de gestión en la nube, ocultando servicios internos y estableciendo túneles seguros.",
    results: [
      "Mejora del 20% en la eficiencia operativa.",
      "Incremento de la seguridad al eliminar la exposición directa de dispositivos.",
      "Reducción del tiempo de inactividad de los equipos."
    ]
  },
  {
    icon: GraduationCap,
    company: "EduTech Systems",
    industry: "Tecnología Educativa",
    problem: "Necesidad de acceso remoto seguro a herramientas administrativas alojadas en servidores locales, con soluciones VPN costosas y complejas.",
    solution: "Real Sync creó dominios virtuales exclusivos para acceso sencillo y seguro a servicios administrativos locales desde cualquier lugar.",
    results: [
      "Reducción del 50% en los costos asociados a VPNs.",
      "Simplificación de la gestión de acceso para el equipo administrativo.",
      "Mejora en la productividad del personal remoto."
    ]
  },
  {
    icon: CreditCard,
    company: "SwiftPay Solutions",
    industry: "Servicios Financieros",
    problem: "Conexión a través de VPN a un banco asociado para procesar transacciones, generando problemas de latencia y altos costos de mantenimiento.",
    solution: "Real Sync estableció túneles seguros para conexiones directas y protegidas con el banco, eliminando la necesidad de VPN tradicional.",
    results: [
      "Reducción del tiempo de procesamiento de pagos en un 20%.",
      "Ahorro del 30% en costos de mantenimiento de infraestructura.",
      "Mejora en la seguridad y confiabilidad del sistema de pago."
    ]
  }
];

export default function TestimonialsAndCaseStudies() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Testimonios y Casos de Éxito</h2>
        <p className="text-center text-gray-600 mb-12">
          <em>Nota: Los siguientes casos de éxito son simulados para ilustrar el potencial impacto de Real Sync en diversos sectores.</em>
        </p>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="flex flex-wrap">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.company}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                  index === activeTestimonial
                    ? 'bg-blue-600 text-white shadow-inner'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTestimonial(index)}
              >
                <testimonial.icon className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">{testimonial.company}</span>
              </button>
            ))}
          </div>
          <div className="p-8">
            <div className="flex items-center mb-6">
              {React.createElement(testimonials[activeTestimonial].icon, { className: "h-12 w-12 text-blue-600 mr-4" })}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{testimonials[activeTestimonial].company}</h3>
                <p className="text-blue-600 font-medium">Industria: {testimonials[activeTestimonial].industry}</p>
              </div>
            </div>
            <div className="mb-6 bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2 text-gray-900">Problema:</h4>
              <p className="text-gray-700 leading-relaxed">{testimonials[activeTestimonial].problem}</p>
            </div>
            <div className="mb-6 bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2 text-blue-900">Solución con Real Sync:</h4>
              <p className="text-blue-800 leading-relaxed">{testimonials[activeTestimonial].solution}</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4 text-gray-900">Resultados:</h4>
              <ul className="space-y-3">
                {testimonials[activeTestimonial].results.map((result) => (
                  <li key={result} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}