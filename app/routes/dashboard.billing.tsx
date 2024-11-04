import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

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

interface UserSubscription {
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
  currentPlan: UserSubscription;
}

const fakeBillingHistory: BillingHistory[] = [
  {
    id: "1",
    date: "2023-05-01",
    amount: 19.99,
    status: "paid",
    invoice: "INV-001",
  }
];

export default function Billing() {
  const [billingHistory] = useState<BillingHistory[]>(fakeBillingHistory);

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
