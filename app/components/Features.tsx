
import FeatureCard from "./FeatureCard";
import { Check, Globe, LinkIcon, Users } from "lucide-react";

export default function Features() {
	return (
		<section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
			<div className="max-w-5xl mx-auto">
				<h2 className="text-2xl font-bold text-center mb-8">
					Key Features of Our Secure Tunnel
				</h2>
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
					<FeatureCard
						icon={<LinkIcon className="w-10 h-10 text-blue-600" />}
						title="Secure Exposure"
						description="Safely expose your local servers to the Internet."
					/>
					<FeatureCard
						icon={<Globe className="w-10 h-10 text-blue-600" />}
						title="Global Access"
						description="Access your local server from anywhere in the world."
					/>
					<FeatureCard
						icon={<Check className="w-10 h-10 text-blue-600" />}
						title="Easy Setup"
						description="Simple command-line interface for quick tunnel creation."
					/>
					<FeatureCard
						icon={<Users className="w-10 h-10 text-blue-600" />}
						title="Team Collaboration"
						description="Share your local work with team members effortlessly."
					/>
				</div>
			</div>
		</section>
	)
}
