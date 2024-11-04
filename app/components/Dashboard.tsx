import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronDown,
  Server,
  Menu,
  Settings,
  User,
  CreditCard,
  LogOut,
  Receipt,
  Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/store/hooks";
import useFetch from "@/hooks/useFetch";

interface Profile {
  hasPaymentMethod: boolean;
  // Add other profile properties as needed
}

const Dashboard: React.FC<React.PropsWithChildren> = ({ children }) => {
  const auth = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const navigate = useNavigate();
  const fetch = useFetch();

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchUserProfile,
  } = useQuery({
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

  useEffect(() => {
    if (userProfile && !userProfile.hasPaymentMethod) {
      setShowPaymentDialog(true);
    }
  }, [userProfile]);

  useEffect(() => {
    const handlePaymentMethodAdded = () => {
      refetchUserProfile();
    };

    window.addEventListener('paymentMethodAdded', handlePaymentMethodAdded);

    return () => {
      window.removeEventListener('paymentMethodAdded', handlePaymentMethodAdded);
    };
  }, [refetchUserProfile]);

  if (!auth.isAuthenticated) {
    return null;
  }

  if (isLoadingProfile) {
    return <div>Loading...</div>;
  }

  if (profileError) {
    return <div>Error loading profile. Please try again.</div>;
  }

  const handleClosePaymentDialog = () => {
    setShowPaymentDialog(false);
    navigate("/dashboard/payment-methods");
  };

  const renderNavigation = () => {
    if (!userProfile?.hasPaymentMethod) {
      return (
        <Link to="/dashboard/payment-methods" className="block mb-2">
          <Button variant="ghost" className="w-full justify-start">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment Methods
          </Button>
        </Link>
      );
    }

    return (
      <>
        <Link to="/dashboard/tunnels" className="block mb-2">
          <Button variant="ghost" className="w-full justify-start">
            <Server className="mr-2 h-4 w-4" />
            Manage Tunnels
          </Button>
        </Link>
        <Link to="/dashboard/plan" className="block mb-2">
          <Button variant="ghost" className="w-full justify-start">
            <CreditCard className="mr-2 h-4 w-4" />
            Active Plan
          </Button>
        </Link>
        <Link to="/dashboard/billing" className="block mb-2">
          <Button variant="ghost" className="w-full justify-start">
            <Receipt className="mr-2 h-4 w-4" />
            Billing History
          </Button>
        </Link>
        <Link to="/dashboard/payment-methods" className="block mb-2">
          <Button variant="ghost" className="w-full justify-start">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment Methods
          </Button>
        </Link>
        <Link to="/dashboard/api-docs" className="block mb-2">
          <Button variant="ghost" className="w-full justify-start">
            <Book className="mr-2 h-4 w-4" />
            API Documentation
          </Button>
        </Link>
      </>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`bg-white w-64 min-h-screen p-4 ${
          sidebarOpen ? "block" : "hidden"
        } md:block`}
      >
        <div className="flex items-center justify-between mb-4 pr-4">
          <h2 className="text-xl font-bold">
            <Link to="/dashboard">RealSync</Link>
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <Menu />
          </Button>
        </div>
        <nav>{renderNavigation()}</nav>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </Button>
          <h1 className="text-xl font-semibold">Welcome to RealSync</h1>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  <span className="mr-2">{auth.user?.fullname}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/logout"
                    className="flex items-center cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>

        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Payment Method Required</DialogTitle>
              <DialogDescription>
                To use RealSync services, you need to register a payment method.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleClosePaymentDialog}>
                Add Payment Method
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;