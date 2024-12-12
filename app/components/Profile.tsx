import { useState, useCallback } from "react";
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
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import type { User } from "@/models/user";
import type { Profile } from "@/models/profile";


export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Pick<User, 'fullname'>>({
    fullname: "",
  });
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
    mutationFn: async (updatedUser: Pick<User, 'fullname'>) => {
      const response = await fetch("/users/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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

  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const avatarFormData = new FormData();
      avatarFormData.append('avatar', file);

      const response = await fetch("/users/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: avatarFormData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        title: "Avatar updated successfully",
        description: "Your profile picture has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating avatar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleAvatarChange = useCallback((file: File) => {
    updateAvatarMutation.mutate(file);
  }, [updateAvatarMutation]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  }, [formData, updateProfileMutation]);

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load profile. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No profile found. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const { user } = profile;

  const renderProfileField = (label: string, value: string, fieldName: keyof User) => (
    <div className="space-y-2 w-full">
      <Label htmlFor={fieldName}>{label}</Label>
      <Input
        id={fieldName}
        name={fieldName}
        defaultValue={value}
        onChange={fieldName === "fullname" ? handleInputChange : undefined}
        disabled={fieldName !== "fullname" || !isEditing}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>View and update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <form onSubmit={handleSubmit}>
                {renderProfileField("Username", user.username, "username")}
                {renderProfileField("Email", user.email, "email")}
                {renderProfileField("Full Name", user.fullname, "fullname")}
                <div className="space-y-2 w-full">
                  <Label htmlFor="stripeCustomerId">Stripe Customer ID</Label>
                  <Input
                    id="stripeCustomerId"
                    value={user.stripeCustomerId}
                    disabled
                  />
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Input
                    id="paymentMethod"
                    value={profile.hasPaymentMethod ? "Added" : "Not added"}
                    disabled
                  />
                </div>
              </form>
            </div>
            <div className="flex-shrink-0">
              <ProfileAvatar
                avatarUrl={user.avatarUrl}
                fullname={user.fullname}
                isEditing={true}
                onAvatarChange={handleAvatarChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Updating..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

