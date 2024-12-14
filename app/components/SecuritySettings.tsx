import { Form } from "@remix-run/react";

interface Session {
  id: number;
  device: string;
  lastActive: string;
}

interface SecuritySettingsProps {
  activeSessions: Session[];
}

export default function SecuritySettings({ activeSessions }: Readonly<SecuritySettingsProps>) {
  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Security</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Change Password</h3>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="action" value="changePassword" />
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
              <input type="password" id="currentPassword" name="currentPassword" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
              <input type="password" id="newPassword" name="newPassword" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Change Password</button>
          </Form>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Active Sessions</h3>
          <ul className="space-y-2">
            {activeSessions.map((session) => (
              <li key={session.id} className="flex justify-between items-center">
                <span>{session.device} - Last activity: {new Date(session.lastActive).toLocaleString()}</span>
                <Form method="post">
                  <input type="hidden" name="action" value="closeSession" />
                  <input type="hidden" name="sessionId" value={session.id} />
                  <button type="submit" className="text-red-600 hover:text-red-800">Close Session</button>
                </Form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

