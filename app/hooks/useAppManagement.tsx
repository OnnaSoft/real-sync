import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { ToastAction } from "../components/ui/toast";
import { Link } from "react-router-dom";
import { App, DedicatedServerPlan } from "../models/app";

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.errors) {
      throw new Error(JSON.stringify(errorData.errors));
    }
    throw new Error(errorData.message || "An error occurred");
  }
  return response.json();
};

const handleError = (error: Error) => {
  try {
    const errorObj = JSON.parse(error.message);
    if (errorObj.app && errorObj.app.message) {
      return errorObj.app.message;
    }
  } catch (e) {
    // If parsing fails, it's not a structured error
  }
  return error.message;
};

export function useAppManagement(token: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const appsQuery = useQuery<App[]>({
    queryKey: ["apps"],
    queryFn: async () => {
      const response = await fetch(`/apps`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await handleResponse(response);
      return data.apps;
    },
    enabled: !!token,
  });

  const dedicatedServerPlansQuery = useQuery<DedicatedServerPlan[]>({
    queryKey: ["dedicatedServerPlans"],
    queryFn: async () => {
      const response = await fetch(`/app-dedicated-server-plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await handleResponse(response);
      return data.data;
    },
    enabled: !!token,
  });

  const createAppMutation = useMutation({
    mutationFn: async (
      newApp: Omit<App, "id" | "apiKeys" | "dedicatedServerPlan"> & {
        dedicatedServerPlanId: number;
      }
    ) => {
      const response = await fetch(`/apps`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newApp),
      });
      const data = await handleResponse(response);
      return data.app;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      toast({
        title: "Success",
        description: "Application created successfully",
      });
    },
    onError: (error: Error) => {
      const errorMessage = handleError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        action: errorMessage.includes("Maximum number of apps reached") ? (
          <ToastAction altText="Upgrade Plan">
            <Link to="/plans">Upgrade Plan</Link>
          </ToastAction>
        ) : undefined,
      });
    },
  });

  const updateAppMutation = useMutation({
    mutationFn: async (app: Omit<App, "dedicatedServerPlan">) => {
      const response = await fetch(`/apps/${app.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(app),
      });
      const data = await handleResponse(response);
      return data.app;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      toast({
        title: "Success",
        description: "Application updated successfully",
      });
    },
    onError: (error: Error) => {
      const errorMessage = handleError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteAppMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/apps/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await handleResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
    },
    onError: (error: Error) => {
      const errorMessage = handleError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (appId: string) => {
      const response = await fetch(`/apps/${appId}/api-keys`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await handleResponse(response);
      return data.apiKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      toast({
        title: "Success",
        description: "API key created successfully",
      });
    },
    onError: (error: Error) => {
      const errorMessage = handleError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async ({ appId, keyId }: { appId: string; keyId: string }) => {
      const response = await fetch(`/apps/${appId}/api-keys/${keyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await handleResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    },
    onError: (error: Error) => {
      const errorMessage = handleError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return {
    apps: appsQuery.data || [],
    dedicatedServerPlans: dedicatedServerPlansQuery.data || [],
    isLoading: appsQuery.isLoading || dedicatedServerPlansQuery.isLoading,
    createApp: createAppMutation.mutateAsync,
    updateApp: updateAppMutation.mutateAsync,
    deleteApp: deleteAppMutation.mutateAsync,
    createApiKey: createApiKeyMutation.mutateAsync,
    deleteApiKey: deleteApiKeyMutation.mutateAsync,
  };
}
