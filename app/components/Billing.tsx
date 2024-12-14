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
import { Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import useFetch from "~/hooks/useFetch";

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: "draft" | "open" | "paid" | "uncollectible" | "void" | null;
  invoice: string | null;
  pdfUrl: string | null;
}

interface BillingHistoryResponse {
  data: BillingHistory[];
}

export default function Billing() {
  const fetch = useFetch();
  const auth = useAppSelector((state) => state.auth);

  const { data, isLoading, error } = useQuery<BillingHistoryResponse, Error>({
    queryKey: ["billingHistory"],
    queryFn: async () => {
      const response = await fetch("/billing", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch billing history");
      }
      return response.json();
    },
  });

  const getStatusBadge = (status: BillingHistory["status"]) => {
    switch (status) {
      case "paid":
        return <Badge variant="default">Paid</Badge>;
      case "open":
        return <Badge variant="secondary">Pending</Badge>;
      case "uncollectible":
      case "void":
        return <Badge variant="destructive">Failed</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading billing history: {error.message}
      </div>
    );
  }

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
              {data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell>${item.amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    {item.pdfUrl ? (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          {item.invoice ?? "Download"}
                        </a>
                      </Button>
                    ) : (
                      "N/A"
                    )}
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