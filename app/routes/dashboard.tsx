import Dashboard from "../components/Dashboard";
import { Outlet } from "@remix-run/react";

export default function Index() {
  return (
    <Dashboard>
      <Outlet />
    </Dashboard>
  );
}
