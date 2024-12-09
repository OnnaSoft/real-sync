import { Briefcase, Globe, Users } from "lucide-react";
import UsageCard from "./UsageCard";

export default function Explanation() {
	return (
		<section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
			<div className="max-w-5xl mx-auto">
				<h2 className="text-2xl font-bold text-center mb-8">
					How to Use RealSync Tunnel
				</h2>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
					<UsageCard
						icon={<Briefcase className="w-10 h-10 text-blue-600" />}
						title="Development"
						description="Expose your local development server for easy testing across devices and networks."
					/>
					<UsageCard
						icon={<Users className="w-10 h-10 text-blue-600" />}
						title="Demonstrations"
						description="Showcase your work-in-progress to clients or team members without deployment."
					/>
					<UsageCard
						icon={<Globe className="w-10 h-10 text-blue-600" />}
						title="API Testing"
						description="Test your APIs with external services or webhooks using a public URL."
					/>
				</div>
			</div>
		</section>
	)
}
