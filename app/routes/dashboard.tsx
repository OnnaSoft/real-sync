import { useAppSelector } from "../store/hooks";
import Dashboard from "../components/Dashboard";
import { Outlet, useNavigate } from "@remix-run/react";

export default function Index() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    navigate("/login");
  }

  return (
    <Dashboard>
      <Outlet />
    </Dashboard>
  );
}
