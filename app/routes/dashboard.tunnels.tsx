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
import { useAppSelector } from "@/store/hooks";
import { Tunnel } from "@/models/tunnel";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface GetTunnelsResponse {
  data: Tunnel[];
}

const formSchema = z.object({
  subdomain: z.string().min(3).max(63).regex(/^[a-z0-9-]+$/),
  allowMultipleConnections: z.boolean().default(false),
});

export default function Tunnels() {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const fetch = useFetch();
  const token = useAppSelector((state) => state.auth.token);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subdomain: "",
      allowMultipleConnections: false,
    },
  });

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

  const handleDeleteTunnel = async (id: number) => {
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateTunnel)} className="space-y-4">
              <FormField
                control={form.control}
                name="subdomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subdomain</FormLabel>
                    <FormControl>
                      <Input placeholder="your-subdomain" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a subdomain for your tunnel (e.g., your-subdomain.realsync-tunnel.com)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowMultipleConnections"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Allow multiple connections
                      </FormLabel>
                      <FormDescription>
                        Enable this to allow multiple simultaneous connections to this tunnel
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Create Tunnel
              </Button>
            </form>
          </Form>
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
                        href={`https://${tunnel.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {`https://${tunnel.domain}`}
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

