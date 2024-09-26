import { useState } from "react";
import { CreditCard, Plus, Trash2, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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

interface PaymentMethod {
  id: string;
  type: "credit" | "debit";
  last4: string;
  expMonth: string;
  expYear: string;
  brand: string;
  isDefault: boolean;
}

const fakePaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "credit",
    last4: "4242",
    expMonth: "12",
    expYear: "2024",
    brand: "Visa",
    isDefault: true,
  },
  {
    id: "2",
    type: "debit",
    last4: "5555",
    expMonth: "10",
    expYear: "2023",
    brand: "Mastercard",
    isDefault: false,
  },
];

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(fakePaymentMethods);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    expMonth: "",
    expYear: "",
    cvc: "",
  });

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const newPaymentMethod: PaymentMethod = {
      id: String(paymentMethods.length + 1),
      type: "credit",
      last4: newCard.number.slice(-4),
      expMonth: newCard.expMonth,
      expYear: newCard.expYear,
      brand: "Visa", // This would normally be determined by the card number
      isDefault: paymentMethods.length === 0, // Make it default if it's the first card
    };
    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setNewCard({ number: "", expMonth: "", expYear: "", cvc: "" });
    setShowAddForm(false);
    toast({
      title: "Payment method added",
      description: "Your new payment method has been successfully added.",
    });
  };

  const handleRemoveCard = (id: string) => {
    const removedCard = paymentMethods.find((pm) => pm.id === id);
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
    toast({
      title: "Payment method removed",
      description: "The selected payment method has been removed.",
    });

    // If the removed card was the default, set a new default
    if (removedCard?.isDefault && paymentMethods.length > 1) {
      const newDefault = paymentMethods.find((pm) => pm.id !== id);
      if (newDefault) {
        handleSetDefault(newDefault.id);
      }
    }
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
      }))
    );
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated.",
    });
  };

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
          <RadioGroup value={paymentMethods.find((pm) => pm.isDefault)?.id}>
            {paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-center">
                  <RadioGroupItem
                    value={pm.id}
                    id={pm.id}
                    className="mr-2"
                    onClick={() => handleSetDefault(pm.id)}
                  />
                  <Label
                    htmlFor={pm.id}
                    className="flex items-center cursor-pointer"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    <span>
                      {pm.brand} •••• {pm.last4}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      Expires {pm.expMonth}/{pm.expYear}
                    </span>
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCard(pm.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </RadioGroup>
          {!showAddForm && (
            <Button className="mt-4" onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Payment Method
            </Button>
          )}
        </CardContent>
      </Card>
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Payment Method</CardTitle>
            <CardDescription>
              Enter your card details to add a new payment method.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={newCard.number}
                  onChange={(e) =>
                    setNewCard({ ...newCard, number: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="expMonth">Expiration Month</Label>
                  <Input
                    id="expMonth"
                    placeholder="MM"
                    value={newCard.expMonth}
                    onChange={(e) =>
                      setNewCard({ ...newCard, expMonth: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="expYear">Expiration Year</Label>
                  <Input
                    id="expYear"
                    placeholder="YYYY"
                    value={newCard.expYear}
                    onChange={(e) =>
                      setNewCard({ ...newCard, expYear: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={newCard.cvc}
                    onChange={(e) =>
                      setNewCard({ ...newCard, cvc: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Card</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
