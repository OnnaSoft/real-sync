import React from "react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Download, CreditCard } from "lucide-react";

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  invoice: string;
}

interface CurrentPlan {
  name: string;
  price: number;
  billingPeriod: string;
  nextBillingDate: string;
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

const fakeCurrentPlan: CurrentPlan = {
  name: "Pro Plan",
  price: 19.99,
  billingPeriod: "monthly",
  nextBillingDate: "2023-06-01",
};

export default function Billing() {
  const [billingHistory] = useState<BillingHistory[]>(fakeBillingHistory);
  const [currentPlan] = useState<CurrentPlan>(fakeCurrentPlan);

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
          <div className="space-y-2">
            <p>
              <strong>Plan:</strong> {currentPlan.name}
            </p>
            <p>
              <strong>Price:</strong> ${currentPlan.price.toFixed(2)} /{" "}
              {currentPlan.billingPeriod}
            </p>
            <p>
              <strong>Next billing date:</strong> {currentPlan.nextBillingDate}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">
            <CreditCard className="mr-2 h-4 w-4" />
            Update Payment Method
          </Button>
        </CardFooter>
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
