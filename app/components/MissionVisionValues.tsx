import { Globe, Star, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function MissionVisionValues() {
  const items = [
    {
      icon: Globe,
      title: "Our Mission",
      description:
        "To simplify traffic and connectivity management, enabling businesses to scale seamlessly across hybrid infrastructures.",
    },
    {
      icon: Star,
      title: "Our Vision",
      description:
        "To become the global standard for reliable, scalable, and innovative connectivity solutions.",
    },
    {
      icon: Heart,
      title: "Our Values",
      description:
        "Innovation, transparency, customer-centricity, and a relentless commitment to excellence.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative">
      <div className="max-w-6xl mx-auto text-center">
        <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 mb-20"></div>
        
        <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-12">
          Mission, Vision & Values
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              className="bg-white shadow-xl rounded-lg p-6 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <item.icon className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
