import { Route, Shield, Cloud, Zap, Settings, Globe } from 'lucide-react';

export default function MainFeatures() {
  const features = [
    {
      icon: Route,
      title: "Advanced Routing",
      description: "Dynamic traffic redirection to multiple servers to optimize performance and load distribution."
    },
    {
      icon: Shield,
      title: "Intelligent Fallback",
      description: "Automatic rerouting in case of server failures, ensuring high availability and service continuity."
    },
    {
      icon: Cloud,
      title: "Hybrid Connectivity",
      description: "Seamless integration between cloud infrastructures and local devices, unifying your technology ecosystem."
    },
    {
      icon: Settings,
      title: "Easy Configuration",
      description: "Intuitive tools for quick and simple implementation, reducing setup time and complexity."
    },
    {
      icon: Zap,
      title: "Enhanced Security",
      description: "Service obfuscation and secure tunnels to protect your data and communications without sacrificing performance."
    },
    {
      icon: Globe,
      title: "Global Scalability",
      description: "Adaptable infrastructure capable of handling worldwide operations, supporting growth and expansion."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-clip-text">
          Main Features
        </h2>
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
