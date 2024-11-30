import React from "react";
import { Link } from "@remix-run/react";
import {
  ArrowRight,
  Check,
  Users,
  Briefcase,
  Globe,
  LinkIcon,
  Shield,
  Zap,
  Code,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Plans from "@/components/Plans";

export default function IndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      <main className="flex-grow">
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Simplified Development with Secure Tunnels
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8">
                Securely expose your local servers to the Internet for easy testing and demonstrations.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

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

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Secure Tunnel: Simplified Development
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Expose your local server to the world
                </h3>
                <p className="text-gray-600 mb-4">
                  Our secure tunnel tool allows you to expose a local server to
                  the Internet through a secure connection. Ideal for
                  development, testing, and demonstrations.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Remote testing without deployment</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Integration with external services (Webhooks)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Real-time demonstrations</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm">
                  <code>
                    $ realsync-tunnel start 8080
                    <br />
                    Tunnel started at: https://demo.realsync-tunnel.com
                    <br />
                    Redirecting traffic to localhost:8080
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Why Choose RealSync Tunnel?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <BenefitCard
                icon={<Shield className="w-12 h-12 text-blue-600" />}
                title="Enhanced Security"
                description="Our tunnels use state-of-the-art encryption to ensure your data remains safe and secure."
              />
              <BenefitCard
                icon={<Zap className="w-12 h-12 text-blue-600" />}
                title="Lightning Fast"
                description="Experience minimal latency with our optimized network infrastructure."
              />
              <BenefitCard
                icon={<Code className="w-12 h-12 text-blue-600" />}
                title="Developer Friendly"
                description="Integrate easily with your existing workflow using our CLI tools and API."
              />
            </div>
            <div className="mt-12 text-center">
              <Link
                to="/features"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition duration-300"
              >
                Learn more about our features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <Plans />

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Ready to revolutionize your development process?
            </h2>
            <p className="text-lg mb-8 text-gray-600">
              Try our secure tunnel service today and simplify your workflow.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Get started now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

interface FeatureCardProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </div>
  );
}

interface UsageCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function UsageCard(props: Readonly<UsageCardProps>) {
  return <FeatureCard {...props} />;
}

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: Readonly<BenefitCardProps>) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </div>
  );
}