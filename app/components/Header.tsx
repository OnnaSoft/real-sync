import { Link } from "@remix-run/react";
import React from "react";

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8">
      <nav className="flex justify-between items-center max-w-5xl mx-auto">
        <div className="text-2xl font-bold text-blue-600">
          <Link to="/">
            RealSync
          </Link>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-blue-600 transition duration-300">Log In</Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300">Sign Up</Link>
        </div>
      </nav>
    </header>
  )
}