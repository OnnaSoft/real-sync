interface ActivityItem {
  id: number;
  action: string;
  date: string;
}

interface ActivityHistoryProps {
  history: ActivityItem[];
}

export default function ActivityHistory({ history }: Readonly<ActivityHistoryProps>) {
  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Activity History</h2>
      <ul className="space-y-2">
        {history.map((item) => (
          <li key={item.id} className="flex justify-between items-center">
            <span>{item.action}</span>
            <span className="text-gray-500">{new Date(item.date).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

