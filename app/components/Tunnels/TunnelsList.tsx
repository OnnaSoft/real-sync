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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tunnel } from "@/models/tunnel";
import { TunnelRow } from "./TunnelRow";

interface TunnelsListProps {
  tunnels: Tunnel[];
  onToggleStatus: (id: number) => void;
  onGenerateNewApiKey: (id: number) => void;
  onToggleMultipleConnections: (id: number) => void;
}

export const TunnelsList: React.FC<TunnelsListProps> = ({
  tunnels,
  onToggleStatus,
  onGenerateNewApiKey,
  onToggleMultipleConnections
}) => {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Active Tunnels</CardTitle>
        <CardDescription>Manage your existing tunnels</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tunnel URL</TableHead>
              <TableHead className="w-[200px]">API Key</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tunnels.map((tunnel) => (
              <TunnelRow
                key={tunnel.id} tunnel={tunnel}
                onToggleMultipleConnections={onToggleMultipleConnections}
                onGenerateNewApiKey={onGenerateNewApiKey}
                onToggleStatus={onToggleStatus} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

