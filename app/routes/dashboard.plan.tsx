import { useState } from "react";
import { PricingCard } from "../components/PricingCard";
import { Button } from "../components/ui/button";
import { toast } from "../hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

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

interface UserPlan {
  planId: number;
  activatedAt: string;
  expiresAt: string;
}

// Datos ficticios para los planes
const fakePlans: Plan[] = [
  {
    id: 1,
    name: "Basic",
    code: "BASIC",
    price: "9.99",
    billingPeriod: "monthly",
    realTimeChat: true,
    voiceCalls: true,
    videoCalls: false,
    maxApps: 1,
    secureConnections: 1,
    supportLevel: "email",
    apiIntegration: true,
    dedicatedAccountManager: false,
  },
  {
    id: 2,
    name: "Pro",
    code: "PRO",
    price: "19.99",
    billingPeriod: "monthly",
    realTimeChat: true,
    voiceCalls: true,
    videoCalls: true,
    maxApps: 3,
    secureConnections: 3,
    supportLevel: "priority",
    apiIntegration: true,
    dedicatedAccountManager: false,
  },
  {
    id: 3,
    name: "Enterprise",
    code: "ENTERPRISE",
    price: "49.99",
    billingPeriod: "monthly",
    realTimeChat: true,
    voiceCalls: true,
    videoCalls: true,
    maxApps: 0,
    secureConnections: 0,
    supportLevel: "dedicated",
    apiIntegration: true,
    dedicatedAccountManager: true,
  },
];

// Datos ficticios para el plan del usuario
const fakeUserPlan: UserPlan = {
  planId: 1,
  activatedAt: "2023-01-01T00:00:00Z",
  expiresAt: "2024-01-01T00:00:00Z",
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

export default function ActivePlan() {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan>(fakeUserPlan);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePlanSelection = (planId: number) => {
    setSelectedPlanId(planId);
  };

  const handlePlanUpdate = () => {
    if (selectedPlanId) {
      setIsUpdating(true);
      // Simulamos una actualización del plan
      setTimeout(() => {
        setUserPlan({
          ...userPlan,
          planId: selectedPlanId,
          activatedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
        setIsUpdating(false);
        toast({
          title: "Plan updated successfully",
          description: "Your active plan has been updated.",
        });
      }, 1000);
    }
  };

  const currentPlan = fakePlans.find((plan) => plan.id === userPlan.planId);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Active Plan</h2>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan && (
            <div className="space-y-2">
              <p>
                <strong>Plan:</strong> {currentPlan.name}
              </p>
              <p>
                <strong>Price:</strong> ${currentPlan.price} /{" "}
                {currentPlan.billingPeriod}
              </p>
              <p>
                <strong>Activated:</strong>{" "}
                {new Date(userPlan.activatedAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Expires:</strong>{" "}
                {new Date(userPlan.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <h3 className="text-xl font-semibold">Available Plans</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {fakePlans.map((plan) => (
          <div key={plan.id} className="flex flex-col h-full">
            <div className="flex-grow flex">
              <PricingCard
                title={plan.name}
                price={plan.price}
                features={getFeatures(plan)}
                highlighted={plan.id === selectedPlanId}
              />
            </div>
            <Button
              className="mt-4 w-full"
              variant={plan.id === userPlan.planId ? "secondary" : "default"}
              onClick={() => handlePlanSelection(plan.id)}
            >
              {plan.id === userPlan.planId ? "Current Plan" : "Select Plan"}
            </Button>
          </div>
        ))}
      </div>
      {selectedPlanId && selectedPlanId !== userPlan.planId && (
        <div className="mt-6 text-center">
          <Button onClick={handlePlanUpdate} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Confirm Plan Change"}
          </Button>
        </div>
      )}
    </div>
  );
}
