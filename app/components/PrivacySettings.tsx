import { Form } from "@remix-run/react";

export default function PrivacySettings() {
  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Privacy</h2>
      <div className="space-y-4">
        <Form method="post">
          <input type="hidden" name="action" value="exportData" />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Export Data</button>
        </Form>
        <div>
          <h3 className="text-lg font-medium mb-2">Legal Documents</h3>
          <ul className="space-y-2">
            <li>
              <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms-of-service" className="text-blue-600 hover:text-blue-800">Terms of Service</a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

