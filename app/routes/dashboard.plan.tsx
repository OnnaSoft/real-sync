import { useState } from "react";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "../store/hooks";

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
  id: number;
  userId: number;
  planId: number;
  status: string;
  activatedAt: string;
  cancelRequestedAt: string | null;
  effectiveCancelDate: string | null;
  plan: Plan;
}

const PlanCard: React.FC<{
  plan: Plan;
  isSelected: boolean;
  isCurrentPlan: boolean;
  onSelect: (planId: number) => void;
}> = ({ plan, isSelected, isCurrentPlan, onSelect }) => {
  return (
    <Card className={`bg-white ${isSelected ? "border-primary" : ""}`}>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          ${plan.price} / {plan.billingPeriod}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex items-center">
            {plan.realTimeChat ? (
              <Check className="text-green-500 mr-2" />
            ) : (
              <X className="text-red-500 mr-2" />
            )}
            Real-time chat
          </li>
          <li className="flex items-center">
            {plan.voiceCalls ? (
              <Check className="text-green-500 mr-2" />
            ) : (
              <X className="text-red-500 mr-2" />
            )}
            Voice calls
          </li>
          <li className="flex items-center">
            {plan.videoCalls ? (
              <Check className="text-green-500 mr-2" />
            ) : (
              <X className="text-red-500 mr-2" />
            )}
            Video calls
          </li>
          <li className="flex items-center">
            <Check className="text-green-500 mr-2" />
            {plan.maxApps === 0 ? "Unlimited" : plan.maxApps} app
            {plan.maxApps !== 1 ? "s" : ""}
          </li>
          <li className="flex items-center">
            <Check className="text-green-500 mr-2" />
            {plan.secureConnections === 0
              ? "Unlimited"
              : plan.secureConnections}{" "}
            secure connection{plan.secureConnections !== 1 ? "s" : ""}
          </li>
          <li className="flex items-center">
            <Check className="text-green-500 mr-2" />
            {plan.supportLevel.charAt(0).toUpperCase() +
              plan.supportLevel.slice(1)}{" "}
            support
          </li>
          <li className="flex items-center">
            {plan.apiIntegration ? (
              <Check className="text-green-500 mr-2" />
            ) : (
              <X className="text-red-500 mr-2" />
            )}
            API integration
          </li>
          <li className="flex items-center">
            {plan.dedicatedAccountManager ? (
              <Check className="text-green-500 mr-2" />
            ) : (
              <X className="text-red-500 mr-2" />
            )}
            Dedicated account manager
          </li>
        </ul>
        <Button
          className="mt-4 w-full"
          variant={isCurrentPlan ? "secondary" : "default"}
          onClick={() => onSelect(plan.id)}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? "Current Plan" : "Select Plan"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function ActivePlan() {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false);
  const [isCancelPlanDialogOpen, setIsCancelPlanDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const token = useAppSelector((state) => state.auth.token);

  const {
    data: plans,
    isLoading: isLoadingPlans,
    error: plansError,
  } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await fetch("/plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }
      const data = await response.json();
      return data.data;
    },
  });

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await fetch("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json();
    },
  });

  const assignPlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await fetch("/users/assign-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign plan");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setSelectedPlanId(null);
      setIsChangePlanDialogOpen(false);
      toast({
        title: "Plan updated successfully",
        description: "Your active plan has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelPlanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/users/cancel-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel plan");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setIsCancelPlanDialogOpen(false);
      toast({
        title: "Plan cancellation requested",
        description: "Your plan cancellation request has been processed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error cancelling plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlanSelection = (planId: number) => {
    setSelectedPlanId(planId);
    setIsChangePlanDialogOpen(true);
  };

  const handlePlanUpdate = () => {
    if (selectedPlanId) {
      assignPlanMutation.mutate(selectedPlanId);
    }
  };

  const handlePlanCancel = () => {
    cancelPlanMutation.mutate();
  };

  if (isLoadingPlans || isLoadingProfile) {
    return <div>Loading plans and profile...</div>;
  }

  if (plansError || profileError) {
    return <div>Error loading plans or profile. Please try again.</div>;
  }

  const currentPlan = userProfile?.currentPlan;
  const selectedPlan = plans?.find((plan) => plan.id === selectedPlanId);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Active Plan</h2>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan ? (
            <div className="space-y-2">
              <p>
                <strong>Plan:</strong> {currentPlan.plan.name}
              </p>
              <p>
                <strong>Price:</strong> ${currentPlan.plan.price} /{" "}
                {currentPlan.plan.billingPeriod}
              </p>
              <p>
                <strong>Activated:</strong>{" "}
                {new Date(currentPlan.activatedAt).toLocaleDateString()}
              </p>
              {currentPlan.status === "pending_cancellation" && (
                <p>
                  <strong>Cancellation Status:</strong> Pending
                </p>
              )}
              {currentPlan.effectiveCancelDate && (
                <p>
                  <strong>Effective Cancel Date:</strong>{" "}
                  {new Date(
                    currentPlan.effectiveCancelDate
                  ).toLocaleDateString()}
                </p>
              )}
              {currentPlan.status !== "pending_cancellation" && (
                <Button
                  onClick={() => setIsCancelPlanDialogOpen(true)}
                  variant="destructive"
                  className="mt-4"
                >
                  Cancel Plan
                </Button>
              )}
            </div>
          ) : (
            <p>No active plan. Select a plan below to get started.</p>
          )}
        </CardContent>
      </Card>

      <h3 className="text-xl font-semibold">Available Plans</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={plan.id === selectedPlanId}
            isCurrentPlan={plan.id === currentPlan?.plan.id}
            onSelect={handlePlanSelection}
          />
        ))}
      </div>

      <Dialog
        open={isChangePlanDialogOpen}
        onOpenChange={setIsChangePlanDialogOpen}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change your plan to {selectedPlan?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangePlanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlanUpdate}
              disabled={assignPlanMutation.isPending}
            >
              {assignPlanMutation.isPending ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCancelPlanDialogOpen}
        onOpenChange={setIsCancelPlanDialogOpen}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Plan Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your current plan? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelPlanDialogOpen(false)}
            >
              Keep Plan
            </Button>
            <Button
              onClick={handlePlanCancel}
              disabled={cancelPlanMutation.isPending}
              variant="destructive"
            >
              {cancelPlanMutation.isPending
                ? "Cancelling..."
                : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
