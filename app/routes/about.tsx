import React from "react";
import { Link } from "@remix-run/react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Code, Globe, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow">
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About RealSync</h1>
            <p className="text-xl text-gray-600 mb-8">
              Connecting people and simplifying real-time development
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Get started
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Contact us
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              <p className="mt-4 text-xl text-gray-600">
                At RealSync, we are dedicated to revolutionizing the way people communicate and collaborate online. Our mission is to provide real-time communication tools that are secure, efficient, and easy to use.
              </p>
            </div>
            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                {[
                  {
                    name: 'Borderless Communication',
                    description: 'We connect teams and individuals worldwide, eliminating distance barriers.',
                    icon: Globe,
                  },
                  {
                    name: 'Constant Innovation',
                    description: 'We strive to be at the forefront of technology, continuously improving our solutions.',
                    icon: Zap,
                  },
                  {
                    name: 'Security First',
                    description: 'The security and privacy of our users is our top priority in everything we do.',
                    icon: Shield,
                  },
                  {
                    name: 'Cutting-edge Development',
                    description: 'We use the latest technologies and best practices to deliver robust and scalable solutions.',
                    icon: Code,
                  },
                ].map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Our Founder and CEO</h2>
              <p className="mt-4 text-xl text-gray-600">
                Meet the visionary behind RealSync
              </p>
            </div>
            <div className="mt-10 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 p-5">
                  <img 
                    className="h-48 w-full object-cover md:w-48" 
                    src="https://juliotorres.digital/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fphoto.f08982e1_1pDSdg.feac9382.webp&w=1080&q=75" 
                    alt="Julio Cesar Jr Torres Moreno" 
                  />
                </div>
                <div className="p-8">
                  <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">Founder and CEO</div>
                  <h3 className="mt-1 text-2xl leading-8 font-semibold text-gray-900">Julio Cesar Jr Torres Moreno</h3>
                  <p className="mt-2 text-gray-600">
                    Experienced software developer with a strong focus on security. Expert in JavaScript, NodeJS, AWS, and real-time messaging integration. Has led impactful projects with robust implementation and a focus on full-stack development.
                  </p>
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-900">Key Experience</h4>
                    <ul className="mt-2 list-disc list-inside text-gray-600">
                      <li>Backend development with a focus on security</li>
                      <li>Management and implementation of AWS services</li>
                      <li>Real-time messaging integration</li>
                      <li>Leadership in full-stack development</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-900">Key Skills</h4>
                    <p className="mt-2 text-gray-600">
                      Node.js, TypeScript, NestJS, TypeORM, Express, ReactJS, Jest, AWS, Docker, and more.
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-4">
                    <a href="https://www.linkedin.com/in/julio-cesar-torres-moreno" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">LinkedIn</a>
                    <a href="https://github.com/juliotorresmoreno" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">GitHub</a>
                    <a href="https://juliotorres.digital/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Website</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}