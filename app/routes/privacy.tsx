import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Introduction</h2>
              <p className="text-sm md:text-base">
                At RealSync, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we care for your personal data when you visit our website and will inform you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Data we collect about you</h2>
              <p className="text-sm md:text-base">
                We may collect, use, store and transfer different types of personal data about you, including:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm md:text-base">
                <li>Identity data</li>
                <li>Contact data</li>
                <li>Technical data</li>
                <li>Usage data</li>
                <li>Marketing and communications data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">3. How we use your personal data</h2>
              <p className="text-sm md:text-base">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm md:text-base">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li>Where we need to comply with a legal or regulatory obligation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Disclosure of your personal data</h2>
              <p className="text-sm md:text-base">
                We may share your personal data with the parties set out below for the purposes set out in this privacy policy:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm md:text-base">
                <li>Service providers who provide IT and system administration services.</li>
                <li>Professional advisers including lawyers, bankers, auditors and insurers.</li>
                <li>Tax authorities, regulators and other authorities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Data security</h2>
              <p className="text-sm md:text-base">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Your legal rights</h2>
              <p className="text-sm md:text-base">
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm md:text-base">
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to processing of your personal data.</li>
                <li>Request restriction of processing your personal data.</li>
                <li>Request transfer of your personal data.</li>
                <li>Withdraw consent at any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Changes to this privacy policy</h2>
              <p className="text-sm md:text-base">
                We reserve the right to update this privacy policy at any time. The new privacy policy will be posted on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Contact</h2>
              <p className="text-sm md:text-base">
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
              </p>
              <address className="mt-2 not-italic text-sm md:text-base">
                RealSync<br />
                Email: privacy@realsync.com<br />
              </address>
            </section>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}