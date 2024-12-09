import { MinusCircle, PlusCircle } from 'lucide-react';
import { useState } from "react";

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-muted">
      <button
        className="flex justify-between items-center w-full py-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg md:text-xl font-semibold text-foreground">
          {question}
        </span>
        {isOpen ? (
          <MinusCircle className="h-7 w-7 text-orange-500 dark:text-orange-400 flex-shrink-0" />
        ) : (
          <PlusCircle className="h-7 w-7 text-orange-500 dark:text-orange-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-6">
          <p className="text-lg leading-relaxed break-words text-rendering-optimizelegibility isolate break-word antialiased text-foreground">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

export default function FrequentlyAskedQuestions() {
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Preguntas Frecuentes
        </h2>
        <div className="space-y-6">
          <FAQItem
            question="¿Real Sync funciona en entornos híbridos?"
            answer="Sí, Real Sync está diseñado específicamente para integrarse sin problemas en entornos híbridos, conectando aplicaciones y servicios en la nube con infraestructura local. Esta capacidad garantiza una experiencia fluida y eficiente, independientemente de dónde se encuentren tus sistemas. Real Sync proporciona una solución versátil que se adapta a las necesidades de las empresas modernas, permitiendo una gestión unificada de recursos distribuidos."
          />
          <FAQItem
            question="¿Cómo se configuran los túneles seguros en Real Sync?"
            answer="Configurar túneles seguros en Real Sync es un proceso sencillo e intuitivo. A través de nuestra interfaz de usuario o línea de comandos, puedes definir los endpoints, establecer reglas de acceso y activar el cifrado. Nuestro equipo también proporciona documentación detallada y soporte para ayudarte durante la implementación. Además, ofrecemos plantillas predefinidas para casos de uso comunes, lo que acelera el proceso de configuración y reduce la posibilidad de errores."
          />
          <FAQItem
            question="¿Qué requisitos técnicos tiene Real Sync?"
            answer="Real Sync es compatible con la mayoría de los entornos modernos. Los requisitos técnicos incluyen: servidor Linux o Windows con capacidad para ejecutar aplicaciones de red, acceso a internet para comunicación entre servidores, recursos mínimos de CPU de 2 núcleos, 4 GB de RAM, y 20 GB de almacenamiento. Opcionalmente, se puede integrar con servicios en la nube como AWS, Google Cloud, o Azure para entornos híbridos. Nuestro equipo de soporte está disponible para ayudarte a evaluar la compatibilidad con tu infraestructura específica y realizar los ajustes necesarios para una implementación exitosa."
          />
          <FAQItem
            question="¿Real Sync reemplaza a las VPNs tradicionales?"
            answer="En muchos casos, sí. Real Sync ofrece capacidades avanzadas que eliminan la necesidad de VPNs tradicionales para tareas específicas, como conectar servidores locales a aplicaciones en la nube o acceder a servicios internos de forma segura. Sin embargo, para conexiones generales de red, ambas soluciones pueden coexistir según las necesidades de tu empresa. Real Sync proporciona una mayor flexibilidad, rendimiento y facilidad de gestión en comparación con las VPNs tradicionales, especialmente en entornos complejos o de gran escala."
          />
          <FAQItem
            question="¿Qué tipo de soporte técnico ofrece Real Sync?"
            answer="En Real Sync, ofrecemos un soporte técnico integral para asegurar el éxito de tu implementación y uso continuo. Nuestro equipo está disponible para ayudarte en todas las etapas, desde la planificación inicial y la implementación hasta la resolución de problemas y la optimización continua. Ofrecemos soporte técnico por correo electrónico, chat en vivo y llamadas telefónicas, dependiendo de tu plan de servicio. Además, proporcionamos una extensa base de conocimientos, tutoriales en video y webinars regulares para ayudarte a aprovechar al máximo las capacidades de Real Sync. Para clientes empresariales, ofrecemos opciones de soporte premium con tiempos de respuesta garantizados y un gestor de cuenta dedicado."
          />
        </div>
      </div>
    </section>
  );
}

