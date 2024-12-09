import { useQuery } from "@tanstack/react-query";
import { PricingCard } from "./PricingCard";
import store from "@/store";
import { logout } from "@/store/slices/authSlice";

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


const fetchPlans = async (): Promise<Plan[]> => {
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

const getFeatures = (plan: Plan): string[] => {
  const features = [];
  features.push(`${plan.freeDataTransferGB} GB free data transfer`);
  features.push(`$${plan.pricePerAdditional10GB.toFixed(2)} per additional 10GB`);
  features.push(`${plan.supportLevel.charAt(0).toUpperCase() + plan.supportLevel.slice(1)} support`);
  if (plan.apiIntegration) features.push("API integration");
  if (plan.dedicatedAccountManager) features.push("Dedicated account manager");
  return features;
};

const formatPrice = (plan: Plan): string => {
  if (plan.basePrice === 0 && plan.freeDataTransferGB === 0 && plan.pricePerAdditional10GB === 0) {
    return "Free";
  }
  return `$${plan.basePrice.toFixed(2)} + $${plan.pricePerAdditional10GB.toFixed(2)}/10GB`;
};

export default function Plans() {
  const {
    data: plans = [],
    isLoading,
    error,
  } = useQuery<Plan[], Error>({
    queryKey: ["plans"],
    queryFn: fetchPlans,
  });

  if (isLoading || plans.length === 0) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Loading plans...
          </h2>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Error loading plans
          </h2>
          <p className="text-center text-red-500">{error.message}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Plans and Pricing
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(plans || []).map((plan) => (
            <PricingCard
              key={plan.id}
              title={plan.name}
              price={formatPrice(plan)}
              features={getFeatures(plan)}
              highlighted={plan.code === "PRO"}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600 mb-4">
            Not sure which plan is right for you? Contact our sales team for a personalized recommendation.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
}