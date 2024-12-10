import { useState } from "react";
import { Link } from "@remix-run/react";
import { Menu, X } from 'lucide-react';

const aboutUrl = "https://onnasoft.us/"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-white shadow-sm">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <Link to="/" className="flex items-center space-x-2">
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
          <span className="text-2xl font-bold text-blue-600">RealSync</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to={aboutUrl} className="text-gray-600 hover:text-blue-600 transition duration-300">About</Link>
          <Link to="/login" className="text-gray-600 hover:text-blue-600 transition duration-300">Log In</Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300">Sign Up</Link>
        </div>

        <button
          className="md:hidden text-gray-600 hover:text-blue-600 transition duration-300"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-white border-t border-gray-200">
          <div className="flex flex-col space-y-4 p-4">
            <Link to={aboutUrl} className="text-gray-600 hover:text-blue-600 transition duration-300">About</Link>
            <Link to="/login" className="text-gray-600 hover:text-blue-600 transition duration-300">Log In</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300 text-center">Sign Up</Link>
          </div>
        </div>
      )}
    </header>
  );
}