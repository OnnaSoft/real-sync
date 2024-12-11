import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import useFetch from "@/hooks/useFetch";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export interface User {
  id: number;
  username: string;
  email: string;
  fullname: string;
  stripeCustomerId: string;
  userSubscription: any[]; // This is an empty array in the example, so we'll use 'any[]' for now
}

export interface CurrentPlan {
  // Add properties for CurrentPlan if needed
}

export interface Profile {
  message: string;
  user: User;
  currentPlan: CurrentPlan | null;
  hasPaymentMethod: boolean;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const token = useAppSelector((state) => state.auth.token);
  const fetch = useFetch();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<Profile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await fetch("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedUser: Partial<User>) => {
      const response = await fetch("/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setIsEditing(false);
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error loading profile. Please try again.</div>;
  }

  if (!profile) {
    return <div>No profile found. Please try again later.</div>;
  }

  const { user } = profile;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>View and update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={user.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  defaultValue={user.fullname}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Full Name:</strong> {user.fullname}</p>
              <p><strong>Stripe Customer ID:</strong> {user.stripeCustomerId}</p>
              <p><strong>Has Payment Method:</strong> {profile.hasPaymentMethod ? "Yes" : "No"}</p>
              <Button onClick={() => setIsEditing(true)} className="mt-4">
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

