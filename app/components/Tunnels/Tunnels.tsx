import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import useFetch from "@/hooks/useFetch";
import { useAppSelector } from "@/store/hooks";
import { Tunnel } from "@/models/tunnel";
import { CreateTunnelForm } from "./CreateTunnelForm";
import { TunnelsList } from "./TunnelsList";

interface GetTunnelsResponse {
  data: Tunnel[];
}

interface TunnelsProps {
  readonly tunnelRootDomain: string;
}

export default function Tunnels({ tunnelRootDomain }: TunnelsProps) {
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
      const { data }: GetTunnelsResponse = await response.json();
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

  const handleCreateTunnel = async (values: { subdomain: string; allowMultipleConnections: boolean }) => {
    try {
      const response = await fetch('/tunnels', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          domain: values.subdomain + '.' + tunnelRootDomain,
          allowMultipleConnections: values.allowMultipleConnections,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create tunnel');
      }
      await fetchTunnels();
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

  const onToggleStatus = async (id: number) => {
    try {
      const tunnel = tunnels.find((tunnel) => tunnel.id === id);
      if (!tunnel) return;

      const response = await fetch(`/tunnels/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'PATCH',
        body: JSON.stringify({ isEnabled: !tunnel.isEnabled }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete tunnel');
      }
      await fetchTunnels();
      toast({
        title: "Success",
        description: "Tunnel updated successfully.",
      });
    } catch (error) {
      console.error("Error updating tunnel:", error);
      toast({
        title: "Error",
        description: "Failed to update tunnel. Please try again.",
        variant: "destructive",
      });
    }
  };
  const onGenerateNewApiKey = async (id: number) => {
    try {
      const tunnel = tunnels.find((tunnel) => tunnel.id === id);
      if (!tunnel) return;

      const response = await fetch(`/tunnels/${id}/regenerate-api-key`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to delete tunnel');
      }
      await fetchTunnels();
      toast({
        title: "Success",
        description: "Tunnel updated successfully.",
      });
    } catch (error) {
      console.error("Error updating tunnel:", error);
      toast({
        title: "Error",
        description: "Failed to update tunnel. Please try again.",
        variant: "destructive",
      });
    }
  };
  const onToggleMultipleConnections = async (id: number) => {
    try {
      const tunnel = tunnels.find((tunnel) => tunnel.id === id);
      if (!tunnel) return;

      const response = await fetch(`/tunnels/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'PATCH',
        body: JSON.stringify({ allowMultipleConnections: !tunnel.allowMultipleConnections }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete tunnel');
      }
      await fetchTunnels();
      toast({
        title: "Success",
        description: "Tunnel updated successfully.",
      });
    } catch (error) {
      console.error("Error updating tunnel:", error);
      toast({
        title: "Error",
        description: "Failed to update tunnel. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const tunnelsListProps = {
    tunnels,
    onToggleStatus,
    onGenerateNewApiKey,
    onToggleMultipleConnections,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Manage Tunnels</h2>
      <CreateTunnelForm tunnelRootDomain={tunnelRootDomain} onCreateTunnel={handleCreateTunnel} />
      <TunnelsList {...tunnelsListProps} />
    </div>
  );
}

