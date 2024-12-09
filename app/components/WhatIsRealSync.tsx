import { ArrowRight } from 'lucide-react';
import imgSrc from '@/assets/iStock-2155769551.jpg';

export default function WhatIsRealSync() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">¿Qué es Real Sync?</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Real Sync es una solución innovadora de gestión de tráfico y conectividad que va más allá de los enfoques tradicionales. Diseñada para empresas que buscan optimizar su infraestructura, Real Sync ofrece una integración perfecta entre servidores locales y en la nube, proporcionando una conectividad robusta y flexible.
            </p>
            <ul className="space-y-6">
              {[
                "Conexión seamless de servidores locales y en la nube",
                "Redirección inteligente de tráfico a múltiples servidores",
                "Capacidades de fallback para garantizar alta disponibilidad"
              ].map((point) => (
                <li key={point} className="flex items-start">
                  <ArrowRight className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 ">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img 
                src={imgSrc} 
                alt="Visualización de tráfico fluido entre servidores y dispositivos" 
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-blue-600/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}