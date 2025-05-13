import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Monitor token deletion manually (optional improvement)
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token && user) {
        logout(); // auto logout on token removal
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, logout]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          Travel Agency
        </Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-6">
          <li><Link to="/" className="hover:text-gray-200">Home</Link></li>
          <li><Link to="/about" className="hover:text-gray-200">About</Link></li>
          <li><Link to="/destination" className="hover:text-gray-200">Destination</Link></li>
          <li><Link to="/packages" className="hover:text-gray-200">Packages</Link></li>
          <li><Link to="/gallery" className="hover:text-gray-200">Gallery</Link></li>
          <li><Link to="/contact" className="hover:text-gray-200">Contact Us</Link></li>
        </ul>

        {/* User Dropdown */}
        <div className="relative">
          {user ? (
            <div>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 hover:text-gray-200"
              >
                <span>{user.firstName}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <ul className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded-md w-40 z-10">
                  <li>
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/bookings" className="block px-4 py-2 hover:bg-gray-100">
                      My Bookings
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 hover:text-gray-200"
              >
                <span>Login / Register</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <ul className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded-md w-40 z-10">
                  <li>
                    <Link to="/login" className="block px-4 py-2 hover:bg-gray-100">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="block px-4 py-2 hover:bg-gray-100">
                      Register
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Placeholder */}
        <div className="md:hidden">
          <button className="text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
