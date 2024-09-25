import { useQuery } from "@tanstack/react-query";
import { PricingCard } from "./PricingCard";

interface Plan {
  id: number;
  name: string;
  code: string;
  price: string;
  billingPeriod: string;
  realTimeChat: boolean;
  voiceCalls: boolean;
  videoCalls: boolean;
  maxApps: number;
  secureConnections: number;
  supportLevel: string;
  apiIntegration: boolean;
  dedicatedAccountManager: boolean;
}

interface PlansResponse {
  message: string;
  total: number;
  data: Plan[];
}

const fetchPlans = async (): Promise<PlansResponse> => {
  const response = await fetch("/plans");
  if (!response.ok) {
    throw new Error("Failed to fetch plans");
  }
  return response.json();
};

const getFeatures = (plan: Plan): string[] => {
  const features = [];
  if (plan.realTimeChat) features.push("Real-time chat");
  if (plan.voiceCalls) features.push("Voice calls");
  if (plan.videoCalls) features.push("Video calls");
  features.push(
    `Up to ${plan.maxApps === 0 ? "unlimited" : plan.maxApps} apps`
  );
  features.push(
    `Secure tunnel (${
      plan.secureConnections === 0 ? "unlimited" : plan.secureConnections
    } connection${plan.secureConnections !== 1 ? "s" : ""})`
  );
  features.push(
    `${
      plan.supportLevel.charAt(0).toUpperCase() + plan.supportLevel.slice(1)
    } support`
  );
  if (plan.apiIntegration) features.push("API integration");
  if (plan.dedicatedAccountManager) features.push("Dedicated account manager");
  return features;
};

export default function Plans() {
  const { data, isLoading, error } = useQuery<PlansResponse, Error>({
    queryKey: ["plans"],
    queryFn: fetchPlans,
  });

  if (isLoading) {
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
          {data?.data.map((plan) => (
            <PricingCard
              key={plan.id}
              title={plan.name}
              price={plan.price}
              features={getFeatures(plan)}
              highlighted={plan.code === "PRO"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
