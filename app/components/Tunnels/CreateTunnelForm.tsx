import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Plus } from 'lucide-react';

const formSchema = z.object({
  subdomain: z.string().min(3).max(63).regex(/^[a-z0-9-]+$/),
  allowMultipleConnections: z.boolean().default(false),
});

interface CreateTunnelFormProps {
  tunnelRootDomain: string;
  onCreateTunnel: (values: z.infer<typeof formSchema>) => void;
}

export const CreateTunnelForm: React.FC<CreateTunnelFormProps> = ({ tunnelRootDomain, onCreateTunnel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subdomain: "",
      allowMultipleConnections: false,
    },
  });

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Create New Tunnel</CardTitle>
        <CardDescription>
          Create a new tunnel for your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onCreateTunnel)} className="space-y-4">
            <FormField
              control={form.control}
              name="subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdomain</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input placeholder="your-subdomain" {...field} />
                      <span className="ml-2 w-[200px]">.{tunnelRootDomain}</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Choose a subdomain for your tunnel (e.g., your-subdomain.{tunnelRootDomain})
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
  );
};

