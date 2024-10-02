import React from "react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "../store/hooks";
import useFetch from "../hooks/useFetch";

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  invoice: string;
}

interface Plan {
  id: number;
  name: string;
  code: string;
  price: string;
  billingPeriod: string;
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

interface UserProfile {
  user: {
    id: number;
    username: string;
    email: string;
    fullname: string;
  };
  currentPlan: UserPlan;
}

const fakeBillingHistory: BillingHistory[] = [
  {
    id: "1",
    date: "2023-05-01",
    amount: 19.99,
    status: "paid",
    invoice: "INV-001",
  },
  {
    id: "2",
    date: "2023-04-01",
    amount: 19.99,
    status: "paid",
    invoice: "INV-002",
  },
  {
    id: "3",
    date: "2023-03-01",
    amount: 19.99,
    status: "paid",
    invoice: "INV-003",
  },
  {
    id: "4",
    date: "2023-02-01",
    amount: 19.99,
    status: "paid",
    invoice: "INV-004",
  },
  {
    id: "5",
    date: "2023-01-01",
    amount: 19.99,
    status: "paid",
    invoice: "INV-005",
  },
];

export default function Billing() {
  const [billingHistory] = useState<BillingHistory[]>(fakeBillingHistory);
  const token = useAppSelector((state) => state.auth.token);
  const fetch = useFetch();

  const {
    data: userProfile,
    isLoading,
    error,
  } = useQuery<UserProfile>({
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

  const getStatusBadge = (status: BillingHistory["status"]) => {
    switch (status) {
      case "paid":
        return <Badge variant="default">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div>Loading billing information...</div>;
  }

  if (error) {
    return <div>Error loading billing information. Please try again.</div>;
  }

  const currentPlan = userProfile?.currentPlan;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Billing</h2>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your current plan and billing details
          </CardDescription>
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
                <strong>Status:</strong> {currentPlan.status}
              </p>
              <p>
                <strong>Activated:</strong>{" "}
                {new Date(currentPlan.activatedAt).toLocaleDateString()}
              </p>
              {currentPlan.cancelRequestedAt && (
                <p>
                  <strong>Cancellation Requested:</strong>{" "}
                  {new Date(currentPlan.cancelRequestedAt).toLocaleDateString()}
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
            </div>
          ) : (
            <p>No active plan. Please select a plan to get started.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your recent billing history and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>${item.amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      {item.invoice}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
