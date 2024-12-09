import { Check, X, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ComparisonTable() {
  const características = [
    "Secure connection between hybrid networks",
    "Load balancing",
    "Dynamic traffic route optimization",
    "Cloud-local integration",
    "Intuitive interface configuration",
    "Automatic scalability",
    "Automatic fallback",
    "Advanced service protection",
    "Optimized performance",
    "Implementation costs"
  ];

  const soluciones = [
    { nombre: "Real Sync", características: [true, true, true, true, true, true, true, true, true, "Low"] },
    { nombre: "VPNs", características: [true, false, false, false, false, false, false, false, false, "High"] },
    { nombre: "Traditional Load Balancers", características: [false, true, false, false, false, true, true, false, true, "Medium"] },
    { nombre: "Limited API Gateways", características: [false, true, true, false, false, false, false, true, false, "Medium"] }
  ];

  const coloresDeCosto: {
    [key: string]: string;
  } = {
    Low: "bg-green-500",
    Medium: "bg-yellow-500",
    High: "bg-red-500"
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-clip-text">
          Comparison with Traditional Solutions
        </h2>
        <div className="overflow-x-auto shadow-xl rounded-lg">
          <motion.table
            className="w-full border-collapse bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
                <th className="border-b border-blue-400 p-4 text-left rounded-tl-lg">
                  <span className="text-lg font-extrabold drop-shadow-sm">Features</span>
                </th>
                {soluciones.map((solución, index) => (
                  <th key={index} className={`border-b border-blue-400 p-4 text-center ${index === soluciones.length - 1 ? 'rounded-tr-lg' : ''}`}>
                    <span className="text-lg font-extrabold drop-shadow-sm">{solución.nombre}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {características.map((característica, índiceDeCaracterística) => (
                <motion.tr
                  key={característica}
                  className={`hover:bg-gray-50 transition-colors duration-150 ease-in-out ${índiceDeCaracterística % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: índiceDeCaracterística * 0.1 }}
                >
                  <td className="border-b border-gray-200 p-4 font-medium text-gray-900">{característica}</td>
                  {soluciones.map((solución, índiceDeSolución) => (
                    <td key={solución.nombre} className="border-b border-gray-200 p-4 text-center">
                      {typeof solución.características[índiceDeCaracterística] === 'boolean' ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <motion.div
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${solución.características[índiceDeCaracterística] ? 'bg-green-100' : 'bg-red-100'
                                  }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {solución.características[índiceDeCaracterística] ? (
                                  <Check className="text-green-600 h-5 w-5" />
                                ) : (
                                  <X className="text-red-600 h-5 w-5" />
                                )}
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{solución.características[índiceDeCaracterística] ? 'Available' : 'Not available'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + índiceDeSolución * 0.1 }}
                        >
                          <Badge className={`${coloresDeCosto[solución.características[índiceDeCaracterística]] as string} text-white font-semibold px-3 py-1`}>
                            {solución.características[índiceDeCaracterística]}
                          </Badge>
                        </motion.div>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4 flex items-start space-x-4">
            <Info className="text-blue-600 h-6 w-6 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-gray-700 mb-2 flex items-center">
                <Check className="text-green-500 h-5 w-5 mr-2" />
                <span>Indicates that the feature is available.</span>
              </p>
              <p className="text-sm text-gray-700 mb-2 flex items-center">
                <X className="text-red-500 h-5 w-5 mr-2" />
                <span>Indicates that the feature is not available.</span>
              </p>
              <p className="text-sm text-gray-700">
                This comparison table highlights how Real Sync stands out compared to traditional solutions in various key aspects of connectivity and traffic management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
