import { ShieldCheck, Zap, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function OurApproach() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Security First",
      description:
        "Our platform ensures data security through advanced encryption and reliable tunneling mechanisms, eliminating risks for businesses.",
    },
    {
      icon: Zap,
      title: "Seamless Integration",
      description:
        "RealSync integrates effortlessly with both local and cloud systems, enabling hybrid infrastructures to operate as one.",
    },
    {
      icon: Cpu,
      title: "Intelligent Traffic Management",
      description:
        "Our technology optimizes traffic routing dynamically, ensuring performance and high availability during peak loads.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Our Approach: Innovation at the Core
          </h2>
          <p className="text-lg text-gray-700 leading-loose mt-4">
            At RealSync, we prioritize simplicity, reliability, and innovation in every aspect of our platform. Here’s how we stand out:
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white shadow-xl rounded-lg p-6 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <feature.icon className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
