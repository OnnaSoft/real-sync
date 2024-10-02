import { useState } from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { toast } from "../hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "../store/hooks";
import {
  StripeProvider,
  CardElement,
  useStripe,
  useElements,
} from "../components/stripe";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import useFetch from "../hooks/useFetch";

interface PaymentMethod {
  id: string;
  type: "credit" | "debit";
  last4: string;
  expMonth: string;
  expYear: string;
  brand: string;
  isDefault: boolean;
  stripePaymentMethodId: string;
}

function StripeCardForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (paymentMethod: Omit<PaymentMethod, "id">) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setProcessing(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setError(error.message || "An error occurred");
      setProcessing(false);
    } else if (paymentMethod) {
      const newPaymentMethod: Omit<PaymentMethod, "id"> = {
        stripePaymentMethodId: paymentMethod.id,
        type: "credit",
        last4: paymentMethod.card?.last4 || "0000",
        expMonth: paymentMethod.card?.exp_month?.toString() || "00",
        expYear: paymentMethod.card?.exp_year?.toString() || "0000",
        brand: paymentMethod.card?.brand || "unknown",
        isDefault: false,
      };
      onSuccess(newPaymentMethod);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="card-element">Card Details</Label>
        <div className="mt-1">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-sm" role="alert">
          {error}
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          aria-label="Cancel adding new payment method"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          aria-label="Add new payment method"
        >
          {processing ? "Processing..." : "Add Card"}
        </Button>
      </div>
    </form>
  );
}

export default function PaymentMethods() {
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();
  const token = useAppSelector((state) => state.auth.token);
  const fetch = useFetch();

  const {
    data: paymentMethods = [],
    isLoading,
    error,
  } = useQuery<PaymentMethod[]>({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      const response = await fetch("/payment-methods", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch payment methods");
      }
      const data = await response.json();
      return data.data;
    },
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: async (newPaymentMethod: Omit<PaymentMethod, "id">) => {
      const response = await fetch("/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPaymentMethod),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add payment method");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      setShowAddForm(false);
      toast({
        title: "Payment method added",
        description: "Your new payment method has been successfully added.",
      });
    },
    onError: (error: Error) => {
      console.error("Error adding payment method:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removePaymentMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/payment-methods/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove payment method");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: "Payment method removed",
        description: "The selected payment method has been removed.",
      });
    },
    onError: (error: Error) => {
      console.error("Error removing payment method:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to remove payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  const setDefaultPaymentMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/payment-methods/${id}/set-default`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to set default payment method"
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      toast({
        title: "Default payment method updated",
        description: "Your default payment method has been updated.",
      });
    },
    onError: (error: Error) => {
      console.error("Error setting default payment method:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to set default payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddCard = (newPaymentMethod: Omit<PaymentMethod, "id">) => {
    addPaymentMethodMutation.mutate(newPaymentMethod);
  };

  const handleRemoveCard = (id: string) => {
    removePaymentMethodMutation.mutate(id);
  };

  const handleSetDefault = (id: string) => {
    setDefaultPaymentMethodMutation.mutate(id);
  };

  const handleCancelAddCard = () => {
    setShowAddForm(false);
  };

  if (isLoading) return <div>Loading payment methods...</div>;
  if (error) return <div>Error loading payment methods. Please try again.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Payment Methods</h2>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Your Payment Methods</CardTitle>
          <CardDescription>
            Manage your saved payment methods here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={
              paymentMethods.find((pm) => pm.isDefault)?.stripePaymentMethodId
            }
          >
            {paymentMethods.map((pm) => (
              <div
                key={pm.stripePaymentMethodId}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-center">
                  <RadioGroupItem
                    value={pm.stripePaymentMethodId}
                    id={pm.stripePaymentMethodId}
                    className="mr-2"
                    onClick={() => handleSetDefault(pm.id)}
                  />
                  <Label
                    htmlFor={pm.stripePaymentMethodId}
                    className="flex items-center cursor-pointer"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    <span>
                      {pm.brand.charAt(0).toUpperCase() + pm.brand.slice(1)}{" "}
                      •••• {pm.last4}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      Expires {pm.expMonth}/{pm.expYear}
                    </span>
                  </Label>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${pm.brand} card ending in ${pm.last4}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your payment method.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemoveCard(pm.id)}
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </RadioGroup>
          {!showAddForm && (
            <Button
              className="mt-4"
              onClick={() => setShowAddForm(true)}
              aria-label="Add new payment method"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Payment Method
            </Button>
          )}
        </CardContent>
      </Card>
      {showAddForm && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Add New Payment Method</CardTitle>
            <CardDescription>
              Enter your card details to add a new payment method.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StripeCardForm
              onSuccess={handleAddCard}
              onCancel={handleCancelAddCard}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
