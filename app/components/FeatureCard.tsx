
interface FeatureCardProps {
	readonly icon: React.ReactNode;
	readonly title: string;
	readonly description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
	return (
		<div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
			<div className="flex justify-center mb-3">{icon}</div>
			<h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
			<p className="text-sm text-gray-600 text-center">{description}</p>
		</div>
	);
}
