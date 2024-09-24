import React, { useState } from "react";
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
import { Globe, Plus, Trash2 } from "lucide-react";

// Simulated tunnel service
const tunnelService = {
  createTunnel: () =>
    new Promise<{ id: string; url: string }>((resolve) =>
      setTimeout(
        () =>
          resolve({
            id: `tunnel-${Date.now()}`,
            url: `https://demo${Date.now()}.realsync-tunnel.com`,
          }),
        1000
      )
    ),
  deleteTunnel: (id: string) =>
    new Promise<void>((resolve) => setTimeout(resolve, 1000)),
};

interface Tunnel {
  id: string;
  url: string;
}

export default function Tunnels() {
  const [tunnels, setTunnels] = useState<Tunnel[]>([
    { id: "tunnel-1", url: "https://demo8080.realsync-tunnel.com" },
    { id: "tunnel-2", url: "https://demo3000.realsync-tunnel.com" },
  ]);

  const handleCreateTunnel = async () => {
    try {
      const newTunnel = await tunnelService.createTunnel();
      setTunnels([...tunnels, newTunnel]);
    } catch (error) {
      console.error("Error creating tunnel:", error);
      alert("Failed to create tunnel. Please try again.");
    }
  };

  const handleDeleteTunnel = async (id: string) => {
    try {
      await tunnelService.deleteTunnel(id);
      setTunnels(tunnels.filter((tunnel) => tunnel.id !== id));
    } catch (error) {
      console.error("Error deleting tunnel:", error);
      alert("Failed to delete tunnel. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Manage Tunnels</h2>

      <Card>
        <CardHeader>
          <CardTitle>Create New Tunnel</CardTitle>
          <CardDescription>
            Create a new tunnel for your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCreateTunnel}>
            <Plus className="mr-2 h-4 w-4" />
            Create Tunnel
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Tunnels</CardTitle>
          <CardDescription>Manage your existing tunnels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tunnel URL</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tunnels.map((tunnel) => (
                <TableRow key={tunnel.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <a
                        href={tunnel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {tunnel.url}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTunnel(tunnel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
