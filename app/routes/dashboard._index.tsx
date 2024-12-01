import { ClientOnly } from 'remix-utils/client-only';
import Dashboard from "~/components/Dashboard";
import DomainTrafficDashboard from "~/components/DomainTrafficDashboard";


export default function Index() {
  return (
    <Dashboard>
      <ClientOnly fallback={<p>Loading charts...</p>}>
        {() => <DomainTrafficDashboard />}
      </ClientOnly>
    </Dashboard>
  );
}
