import { useState } from "react";
import { Link } from "@remix-run/react";
import { Menu, X } from "lucide-react";

const aboutUrl = "https://onnasoft.us/";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="py-4 px-6 lg:px-8 bg-white shadow-md sticky top-0 z-50">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <svg
            className="w-8 h-8 text-primary"
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
          <span className="text-2xl font-bold text-primary">RealSync</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to={aboutUrl}
            className="text-gray-600 hover:text-primary transition duration-300 font-medium"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-gray-600 hover:text-primary transition duration-300 font-medium"
          >
            Contact
          </Link>
          <Link
            to="/login"
            className="text-gray-600 hover:text-primary transition duration-300 font-medium"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="bg-primary text-white px-5 py-2 rounded-full hover:bg-primary/90 transition duration-300 font-semibold"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-600 hover:text-primary transition duration-300"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-white border-t border-gray-200 shadow-lg rounded-lg">
          <div className="flex flex-col space-y-4 p-4">
            <Link
              to={aboutUrl}
              className="text-gray-600 hover:text-primary transition duration-300 font-medium"
            >
              About
            </Link>
            <Link
              to="/login"
              className="text-gray-600 hover:text-primary transition duration-300 font-medium"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition duration-300 text-center font-semibold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
