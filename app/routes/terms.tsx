import React from "react";
import { Link } from "@remix-run/react";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm md:text-base">
                By accessing and using RealSync's services, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Service Description</h2>
              <p className="text-sm md:text-base">
                RealSync provides real-time communication services, including chat, voice calls, video calls, and a secure tunnel for exposing local servers. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Account Registration</h2>
              <p className="text-sm md:text-base">
                To use our services, you must create an account. You are responsible for maintaining the confidentiality of your account and password, and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Acceptable Use</h2>
              <p className="text-sm md:text-base">
                You agree not to use RealSync for any purpose that is unlawful or prohibited by these terms. You must not transmit any material that is illegal, threatening, defamatory, obscene, scandalous, pornographic, or profane.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Privacy and Data Protection</h2>
              <p className="text-sm md:text-base">
                Your privacy is important to us. Please refer to our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> for information on how we collect, use, and protect your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Intellectual Property</h2>
              <p className="text-sm md:text-base">
                All content included in RealSync, such as text, graphics, logos, images, as well as the compilation thereof, is the property of RealSync or its content suppliers and protected by intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Limitation of Liability</h2>
              <p className="text-sm md:text-base">
                RealSync shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or the inability to use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Modifications to Terms</h2>
              <p className="text-sm md:text-base">
                We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this page. It is recommended to review this page periodically to stay informed of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Governing Law</h2>
              <p className="text-sm md:text-base">
                These terms shall be governed and construed in accordance with the laws of [Country/State], without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Contact</h2>
              <p className="text-sm md:text-base">
                If you have any questions about these Terms and Conditions, you can contact us at:
              </p>
              <address className="mt-2 not-italic text-sm md:text-base">
                RealSync<br />
                Email: legal@realsync.com<br />
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