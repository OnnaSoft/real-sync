import React from "react";
import { Link, useLocation } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { Server, CreditCard, Receipt, Book, Home } from 'lucide-react';

interface SidebarProps {
  hasPaymentMethod: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ hasPaymentMethod }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const renderNavigation = () => {
    const commonClasses = "w-full justify-start text-sm font-medium transition-colors hover:text-blue-600 hover:bg-blue-50";
    const activeClasses = "bg-blue-100 text-blue-600";

    if (!hasPaymentMethod) {
      return (
        <Link to="/dashboard/payment-methods" className="block">
          <Button
            variant="ghost"
            className={`${commonClasses} ${isActive('/dashboard/payment-methods') ? activeClasses : ''}`}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Payment Methods
          </Button>
        </Link>
      );
    }

    const navItems = [
      { path: '/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/dashboard/tunnels', icon: Server, label: 'Manage Tunnels' },
      { path: '/dashboard/plan', icon: CreditCard, label: 'Active Plan' },
      { path: '/dashboard/billing', icon: Receipt, label: 'Billing History' },
      { path: '/dashboard/payment-methods', icon: CreditCard, label: 'Payment Methods' },
      { path: '/dashboard/api-docs', icon: Book, label: 'API Documentation' },
    ];

    return (
      <>
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className="block mb-1">
            <Button
              variant="ghost"
              className={`${commonClasses} ${isActive(item.path) ? activeClasses : ''}`}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </>
    );
  };

  return (
    <aside className="bg-white w-64 min-h-screen border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-blue-600">
          <Link to="/dashboard" className="hover:text-blue-700 transition-colors">RealSync</Link>
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">{renderNavigation()}</nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} RealSync</p>
      </div>
    </aside>
  );
};

