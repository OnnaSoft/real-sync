import React, { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useAppSelector } from "@/store/hooks";
import { useUserProfile } from "@/hooks/userProfile";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PaymentMethodDialog } from "./PaymentMethodDialog";
import { Button } from "@/components/ui/button";
import { Menu, Loader2 } from 'lucide-react';

const Dashboard: React.FC<React.PropsWithChildren> = ({ children }) => {
  const auth = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const navigate = useNavigate();

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchUserProfile,
  } = useUserProfile();

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

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
    }
  }, [auth.isAuthenticated, navigate]);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error loading profile</h2>
          <p className="text-gray-600">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  const handleClosePaymentDialog = () => {
    setShowPaymentDialog(false);
    navigate("/dashboard/payment-methods");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`md:block ${sidebarOpen ? 'block' : 'hidden'} md:relative absolute inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <Sidebar hasPaymentMethod={userProfile?.hasPaymentMethod || false} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header username={auth.user?.fullname ?? ""} />

        <main className="flex flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>

        <PaymentMethodDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          onClose={handleClosePaymentDialog}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-3 left-3 z-50 bg-white shadow-md rounded-full"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {sidebarOpen && (
        <button 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
    </div>
  );
};

export default Dashboard;

