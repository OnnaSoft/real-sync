import React from "react";
import { Link } from "@remix-run/react";
import { Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch } from "~/store/hooks";
import { logout } from "~/store/slices/authSlice";

interface HeaderProps {
  username: string;
}

export const Header: React.FC<HeaderProps> = ({ username }) => {
  const dispatch = useAppDispatch();
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-primary border-b border-primary px-4 lg:px-6 h-16 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-6">
        <h1 className="text-lg font-semibold text-white tracking-wide hidden sm:inline-block">
          Welcome to RealSync
        </h1>
      </div>
      <div className="flex items-center space-x-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-cyan-500 hover:text-white hover:bg-primary transition-all duration-200"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-3 text-cyan-500 hover:text-white hover:bg-primary transition-all duration-200"
            >
              <Avatar className="h-10 w-10 ring-2 ring-cyan-500">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${username}.png`}
                  alt={username}
                />
                <AvatarFallback className="bg-blue-500 text-white">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden sm:inline-block text-white">
                {username}
              </span>
              <ChevronDown className="h-4 w-4 text-cyan-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/profile"
                className="flex items-center cursor-pointer text-gray-700 hover:bg-gray-100 px-2 py-2 rounded-md transition-all duration-200"
              >
                <User className="mr-2 h-4 w-4 text-blue-500" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/settings"
                className="flex items-center cursor-pointer text-gray-700 hover:bg-gray-100 px-2 py-2 rounded-md transition-all duration-200"
              >
                <Settings className="mr-2 h-4 w-4 text-blue-500" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 border-gray-300" />
            <DropdownMenuItem asChild>
              <button
                onClick={handleLogout}
                className="flex items-center cursor-pointer text-red-500 hover:bg-red-100 px-2 py-2 rounded-md transition-all duration-200 w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
