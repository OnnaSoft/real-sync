import { useLoaderData } from "@remix-run/react";
import DashboardLayout from "~/components/Dashboard/DashboardLayout";
import Tunnels from "~/components/Tunnels";

type LoaderData = {
  tunnelRootDomain: string;
};

export const loader = async () => {
  const tunnelRootDomain = process.env.TUNNEL_ROOT_DOMAIN;

  if (!tunnelRootDomain) {
    throw new Error("TUNNEL_ROOT_DOMAIN environment variable is not set");
  }

  return { tunnelRootDomain };
};

export default function Page() {
  const { tunnelRootDomain } = useLoaderData<LoaderData>();

  return (
    <DashboardLayout>
      <Tunnels tunnelRootDomain={tunnelRootDomain} />
    </DashboardLayout>
  );
}
