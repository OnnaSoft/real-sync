import { Link } from '@remix-run/react';

interface FooterProps {
  readonly onnasoftUrl: string;
}

export default function Footer({ onnasoftUrl }: FooterProps) {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 className="text-lg font-semibold">RealSync</h3>
            </div>
            <p className="text-sm text-gray-400">
              Optimizing connectivity and empowering businesses through innovative solutions.
            </p>
          </div>
          {/* Empty Column */}
          <div />
          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to={onnasoftUrl}
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to={"/contact"}
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Social Media and Newsletter */}
        <div className="mt-8">
          <div className="flex justify-center space-x-6 mb-6">
            <a
              href="https://twitter.com/realsync"
              aria-label="Twitter"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="https://facebook.com/realsync"
              aria-label="Facebook"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <i className="fab fa-facebook"></i>
            </a>
            <a
              href="https://linkedin.com/company/realsync"
              aria-label="LinkedIn"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>
        {/* Footer Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} RealSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
