import React, { useState } from "react";
import { Link } from "@remix-run/react";
import {
  Bell,
  ChevronDown,
  Home,
  Users,
  Server,
  Menu,
  Settings,
  User,
  Headphones,
  CreditCard,
  LogOut,
  Receipt,
  Book,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAppSelector } from "@/store/hooks";

const Dashboard: React.FC<React.PropsWithChildren> = ({ children }) => {
  const auth = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
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
        <nav>
          {/*<Link to="/dashboard/communication" className="block mb-2">
            <Button variant="ghost" className="w-full justify-start">
              <Headphones className="mr-2 h-4 w-4" />
              Communication
            </Button>
          </Link>*/}
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
        </nav>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
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

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
