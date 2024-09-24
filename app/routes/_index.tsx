import React from "react";
import { Link } from "@remix-run/react";
import {
  MessageSquare,
  Phone,
  Video,
  ArrowRight,
  Check,
  Users,
  Briefcase,
  Globe,
  LinkIcon,
} from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      <main className="flex-grow">
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Real-Time Communication and Simplified Development
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8">
                Connect with chat, calls, video calls, and securely expose your
                local servers.
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
              Key Features
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<MessageSquare className="w-10 h-10 text-blue-600" />}
                title="Real-time Chat"
                description="Communicate quickly with instant messages."
              />
              <FeatureCard
                icon={<Phone className="w-10 h-10 text-blue-600" />}
                title="Voice Calls"
                description="High-quality calls without interruptions."
              />
              <FeatureCard
                icon={<Video className="w-10 h-10 text-blue-600" />}
                title="Video Calls"
                description="Connect face-to-face with stable video calls."
              />
              <FeatureCard
                icon={<LinkIcon className="w-10 h-10 text-blue-600" />}
                title="Secure Tunnel"
                description="Securely expose your local servers to the Internet."
              />
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              How to Use RealSync
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <UsageCard
                icon={<Users className="w-10 h-10 text-blue-600" />}
                title="Work Teams"
                description="Create channels for different projects, share files, and coordinate tasks with your team in real-time."
              />
              <UsageCard
                icon={<Briefcase className="w-10 h-10 text-blue-600" />}
                title="Business Meetings"
                description="Organize video calls with clients or partners, share your screen, and take collaborative notes during the meeting."
              />
              <UsageCard
                icon={<Globe className="w-10 h-10 text-blue-600" />}
                title="Development and Testing"
                description="Use our secure tunnel to expose your local applications, facilitate remote testing, and real-time demonstrations."
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
              <div className="bg-gray-100 p-4 rounded-lg">
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

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Implement Chat on Your Website
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Simple Chat Integration
                </h3>
                <p className="text-gray-600 mb-4">
                  Add our real-time chat to your website with just a few lines
                  of code. Customize the appearance to match your brand and
                  start interacting with your visitors instantly.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Single script installation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Complete customization</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Support for multiple languages</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold mb-2">
                    Implementation Code
                  </h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <code>
                      {`<script src="https://cdn.realsync.io/chat.js"></script>
<script>
  RealSync.init({
    apiKey: 'YOUR_API_KEY',
    containerId: 'chat-container'
  });
</script>
<div id="chat-container"></div>`}
                    </code>
                  </pre>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="bg-blue-600 text-white p-2 rounded-t-lg">
                    Live Chat
                  </div>
                  <div className="h-32 bg-gray-100 p-2 overflow-y-auto">
                    <div className="mb-2">
                      <span className="font-semibold">User:</span> Hello, how
                      can I help you?
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Visitor:</span> I have a
                      question about your services.
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Plans and Pricing
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <PricingCard
                title="Basic"
                price="9.99"
                features={[
                  "Real-time chat",
                  "Voice calls",
                  "Up to 5 users",
                  "Secure tunnel (1 connection)",
                  "Email support",
                ]}
              />
              <PricingCard
                title="Pro"
                price="19.99"
                features={[
                  "Everything in Basic",
                  "Video calls",
                  "Up to 20 users",
                  "Secure tunnel (3 connections)",
                  "Priority support",
                ]}
                highlighted={true}
              />
              <PricingCard
                title="Enterprise"
                price="49.99"
                features={[
                  "Everything in Pro",
                  "Unlimited users",
                  "Secure tunnel (unlimited connections)",
                  "API integration",
                  "Dedicated account manager",
                ]}
              />
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Ready to revolutionize your communication and development?
            </h2>
            <p className="text-lg mb-8 text-gray-600">
              Try our real-time communication service and secure tunnel today.
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
  icon: React.ReactNode;
  title: string;
  description: string;
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

function UsageCard({ icon, title, description }: UsageCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </div>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

function PricingCard({
  title,
  price,
  features,
  highlighted = false,
}: PricingCardProps) {
  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-md ${
        highlighted ? "border-2 border-blue-500 relative" : ""
      }`}
    >
      {highlighted && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-bold mb-3 text-center">{title}</h3>
      <p className="text-3xl font-bold text-center mb-4">
        ${price}
        <span className="text-lg text-gray-500">/month</span>
      </p>
      <ul className="space-y-2 mb-4 text-sm">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
