import { Form } from "@remix-run/react";
import { User } from "~/models/user";


interface AccountSettingsProps {
  user: User;
}

export default function AccountSettings({ user }: Readonly<AccountSettingsProps>) {
  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
      <Form method="post" className="space-y-4">
        <input type="hidden" name="action" value="updateAccount" />
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input 
            type="text" id="name" name="name" 
            readOnly value={user.fullname} required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email" id="email" name="email"
            readOnly value={user.email} required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
        </div>
      </Form>
    </section>
  );
}

