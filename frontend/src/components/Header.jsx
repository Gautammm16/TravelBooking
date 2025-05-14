import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token && user) logout();
    }, 1000);
    return () => clearInterval(interval);
  }, [user, logout]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          Travel Agency
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={toggleMobileMenu}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* Menu Items */}
        <div className={`w-full md:flex md:items-center md:justify-between md:w-auto ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <ul className="flex flex-col md:flex-row md:space-x-6 mt-4 md:mt-0">
            <li><Link to="/" className="block px-2 py-1 hover:text-gray-200">Home</Link></li>
            <li><Link to="/about" className="block px-2 py-1 hover:text-gray-200">About</Link></li>
            <li><Link to="/destination" className="block px-2 py-1 hover:text-gray-200">Destination</Link></li>
            <li><Link to="/packages" className="block px-2 py-1 hover:text-gray-200">Packages</Link></li>
            <li><Link to="/gallery" className="block px-2 py-1 hover:text-gray-200">Gallery</Link></li>
            <li><Link to="/contact" className="block px-2 py-1 hover:text-gray-200">Contact Us</Link></li>

            {/* Dropdown in Mobile View */}
            <li className="md:hidden">
              <button onClick={toggleDropdown} className="w-full text-left flex items-center px-2 py-1 space-x-2 hover:text-gray-200">
                <span>{user ? user.firstName : "Login / Register"}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <ul className="bg-white text-black mt-1 shadow-md rounded-md w-full z-10">
                  {user ? (
                    <>
                      <li><Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link></li>
                      <li><Link to="/bookings" className="block px-4 py-2 hover:bg-gray-100">My Bookings</Link></li>
                      <li><button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button></li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/login" className="block px-4 py-2 hover:bg-gray-100">Login</Link></li>
                      <li><Link to="/register" className="block px-4 py-2 hover:bg-gray-100">Register</Link></li>
                    </>
                  )}
                </ul>
              )}
            </li>
          </ul>
        </div>

        {/* Dropdown in Desktop View */}
        <div className="relative hidden md:block ml-4">
          <button onClick={toggleDropdown} className="flex items-center space-x-2 hover:text-gray-200">
            <span>{user ? user.firstName : "Login / Register"}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <ul className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded-md w-40 z-10">
              {user ? (
                <>
                  <li><Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link></li>
                  <li><Link to="/bookings" className="block px-4 py-2 hover:bg-gray-100">My Bookings</Link></li>
                  <li><button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="block px-4 py-2 hover:bg-gray-100">Login</Link></li>
                  <li><Link to="/register" className="block px-4 py-2 hover:bg-gray-100">Register</Link></li>
                </>
              )}
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
