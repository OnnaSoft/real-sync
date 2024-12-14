
import AccountSettings from "~/components/AccountSettings";
import ActivityHistory from "~/components/ActivityHistory";
import Dashboard from "~/components/Dashboard";
import PrivacySettings from "~/components/PrivacySettings";
import SecuritySettings from "~/components/SecuritySettings";
import { useAppSelector } from "~/store/hooks";

const activeSessions = [
  { id: 1, device: "Chrome on Windows", lastActive: "2023-05-10T10:30:00Z" },
  { id: 2, device: "Firefox on MacOS", lastActive: "2023-05-09T14:45:00Z" },
]

const activityHistory = [
  { id: 1, action: "Password change", date: "2023-05-08T09:15:00Z" },
  { id: 2, action: "Login", date: "2023-05-07T18:30:00Z" },
]

export default function Page() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return null;
  }

  return (
    <Dashboard>
      <SecuritySettings activeSessions={activeSessions} />
      <AccountSettings user={user} />
      <ActivityHistory history={activityHistory} />
      <PrivacySettings />
    </Dashboard>
  );
}
