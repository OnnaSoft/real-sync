import { Check, X, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ComparisonTableProps {
  readonly backgroundColor: string;
}

export default function ComparisonTable({ backgroundColor }: ComparisonTableProps) {
  const features = [
    "Secure connection between hybrid networks",
    "Load balancing",
    "Dynamic traffic route optimization",
    "Cloud-local integration",
    "Intuitive interface configuration",
    "Automatic scalability",
    "Automatic fallback",
    "Advanced service protection",
    "Optimized performance",
    "Implementation costs",
  ];

  const solutions = [
    {
      name: "Real Sync",
      features: [true, true, true, true, true, true, true, true, true, "Low"],
    },
    {
      name: "VPNs",
      features: [true, false, false, false, false, false, false, false, false, "High"],
    },
    {
      name: "Traditional Load Balancers",
      features: [false, true, false, false, false, true, true, false, true, "Medium"],
    },
    {
      name: "Limited API Gateways",
      features: [false, true, true, false, false, false, false, true, false, "Medium"],
    },
  ];

  const costColors: { [key: string]: string } = {
    Low: "bg-green-500",
    Medium: "bg-yellow-500",
    High: "bg-red-500",
  };

  return (
    <section className={`py-16 px-6 lg:px-16 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
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
              <tr className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                <th className="border-b border-blue-300 p-4 text-left rounded-tl-lg">
                  <span className="text-lg font-bold">Features</span>
                </th>
                {solutions.map((solution, index) => (
                  <th
                    key={solution.name}
                    className={`border-b border-blue-300 p-4 text-center ${
                      index === solutions.length - 1 ? "rounded-tr-lg" : ""
                    }`}
                  >
                    <span className="text-lg font-bold">{solution.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, featureIndex) => (
                <motion.tr
                  key={feature}
                  className={`hover:bg-gray-50 transition-colors ${
                    featureIndex % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: featureIndex * 0.1 }}
                >
                  <td className="border-b border-gray-200 p-4 font-medium text-gray-800">
                    {feature}
                  </td>
                  {solutions.map((solution, solutionIndex) => (
                    <td
                      key={solution.name}
                      className="border-b border-gray-200 p-4 text-center"
                    >
                      {typeof solution.features[featureIndex] === "boolean" ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <motion.div
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                  solution.features[featureIndex]
                                    ? "bg-green-100"
                                    : "bg-red-100"
                                }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {solution.features[featureIndex] ? (
                                  <Check className="text-green-600 h-5 w-5" />
                                ) : (
                                  <X className="text-red-600 h-5 w-5" />
                                )}
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {solution.features[featureIndex]
                                  ? "Available"
                                  : "Not available"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge
                          className={`${
                            costColors[solution.features[featureIndex]]
                          } text-white font-semibold px-3 py-1`}
                        >
                          {solution.features[featureIndex]}
                        </Badge>
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
                This comparison table highlights how Real Sync stands out
                compared to traditional solutions in various key aspects of
                connectivity and traffic management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
