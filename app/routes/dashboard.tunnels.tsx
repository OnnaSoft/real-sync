import { useState, useEffect } from "react";
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
import { Globe, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useFetch from "@/hooks/useFetch";
import { useAppSelector } from "~/store/hooks";

interface Tunnel {
  id: string;
  url: string;
}

export default function Tunnels() {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const fetch = useFetch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    fetchTunnels();
  }, []);

  const fetchTunnels = async () => {
    try {
      const response = await fetch('/tunnels', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tunnels');
      }
      const data = await response.json();
      setTunnels(data);
    } catch (error) {
      console.error("Error fetching tunnels:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tunnels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTunnel = async () => {
    try {
      const response = await fetch('/tunnels', {
        headers: { Authorization: `Bearer ${token}` },
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to create tunnel');
      }
      const newTunnel = await response.json();
      setTunnels([...tunnels, newTunnel]);
      toast({
        title: "Success",
        description: "Tunnel created successfully.",
      });
    } catch (error) {
      console.error("Error creating tunnel:", error);
      toast({
        title: "Error",
        description: "Failed to create tunnel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTunnel = async (id: string) => {
    try {
      const response = await fetch(`/tunnels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete tunnel');
      }
      setTunnels(tunnels.filter((tunnel) => tunnel.id !== id));
      toast({
        title: "Success",
        description: "Tunnel deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting tunnel:", error);
      toast({
        title: "Error",
        description: "Failed to delete tunnel. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Manage Tunnels</h2>

      <Card className="bg-white">
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

