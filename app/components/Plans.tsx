import { useQuery } from "@tanstack/react-query";
import { PricingCard } from "./PricingCard";
import store from "@/store";
import { logout } from "@/store/slices/authSlice";
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useFetch from "~/hooks/useFetch";

interface Plan {
  id: number;
  name: string;
  code: string;
  basePrice: number;
  freeDataTransferGB: number;
  pricePerAdditional10GB: number;
  billingPeriod: string;
  supportLevel: string;
  apiIntegration: boolean;
  dedicatedAccountManager: boolean;
}

const fetchPlans = (fetch: ReturnType<typeof useFetch>) => async (): Promise<Plan[]> => {
  const response = await fetch("/plans");
  if (response.status === 401) {
    store.dispatch(logout());
    return [];
  }
  if (!response.ok) {
    throw new Error("Failed to fetch plans");
  }
  const { data } = await response.json();
  return data;
};

const getFeatures = (plan: Plan): string[] => [
  `${plan.freeDataTransferGB} GB free data transfer`,
  `$${plan.pricePerAdditional10GB.toFixed(2)} per additional 10GB`,
  `${plan.supportLevel.charAt(0).toUpperCase() + plan.supportLevel.slice(1)} support`,
  ...(plan.apiIntegration ? ["API integration"] : []),
  ...(plan.dedicatedAccountManager ? ["Dedicated account manager"] : []),
];

const formatPrice = (plan: Plan): string => {
  if (plan.basePrice === 0 && plan.freeDataTransferGB === 0 && plan.pricePerAdditional10GB === 0) {
    return "Free";
  }
  return `$${plan.basePrice.toFixed(2)} + $${plan.pricePerAdditional10GB.toFixed(2)}/10GB`;
};

export default function Plans() {
  const fetch = useFetch();
  const {
    data: plans = [],
    isLoading,
    error,
  } = useQuery<Plan[], Error>({
    queryKey: ["plans"],
    queryFn: fetchPlans(fetch),
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Loading plans...</h2>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-400 mr-2" />
              <h2 className="text-2xl font-bold text-red-700">Error loading plans</h2>
            </div>
            <p className="mt-2 text-red-600">{error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-12 bg-clip-text">
          Plans and Pricing
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PricingCard
                title={plan.name}
                price={formatPrice(plan)}
                features={getFeatures(plan)}
                highlighted={plan.code === "PRO"}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xl text-gray-600 mb-6">
            Not sure which plan is right for you? Contact our sales team for a personalized recommendation.
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-xl"
                >
                  Contact Sales
                  <Info className="ml-2 h-5 w-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get expert advice on choosing the right plan for your needs</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
}

