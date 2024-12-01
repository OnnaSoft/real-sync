import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import useFetch from "@/hooks/useFetch";

interface Profile {
  hasPaymentMethod: boolean;
}

export function useUserProfile() {
  const auth = useAppSelector((state) => state.auth);
  const fetch = useFetch();

  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async (): Promise<Profile> => {
      const response = await fetch("/users/profile", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json();
    },
    retry: true,
    retryDelay: 5000,
    refetchInterval: 60000 * 5,
  });
}

