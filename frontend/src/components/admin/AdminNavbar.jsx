

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, Home } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-white bg-blue-600 px-4 py-2 rounded w-full block flex items-center space-x-2'
      : 'text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded w-full block transition flex items-center space-x-2';

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-12 left-0 w-full flex items-center justify-between bg-white shadow-sm px-4 py-3 z-50">
        <button 
          onClick={() => setIsOpen(true)} 
          aria-label="Open Menu"
          className="p-2 hover:bg-gray-100 rounded"
        >
          <Menu className="w-6 h-6 text-blue-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Sidebar for both mobile (drawer) and desktop */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-screen`}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div>
              <h2 className="text-blue-600 text-lg font-semibold">Admin Panel</h2>
              <p className="text-xs text-gray-500">{user?.name || 'Administrator'}</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)} 
            aria-label="Close Menu"
            className="md:hidden p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-1 p-4">
          {/* Main Navigation */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Main
            </h3>
            <NavLink 
              to="/admin/dashboard" 
              className={navLinkClass}
              onClick={handleLinkClick}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* Tour Management */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Tour Management
            </h3>
            <NavLink 
              to="/admin/create-tour" 
              className={navLinkClass}
              onClick={handleLinkClick}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Tour</span>
            </NavLink>
            <NavLink 
              to="/admin/manage-tours" 
              className={navLinkClass}
              onClick={handleLinkClick}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Manage Tours</span>
            </NavLink>
            <NavLink 
              to="/admin/custom-tour-requests" 
              className={navLinkClass}
              onClick={handleLinkClick}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8h6m-6 0a2 2 0 01-2-2V9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2m-6 0V9" />
              </svg>
              <span>Custom Tour Requests</span>
            </NavLink>
          </div>

          {/* Booking & User Management */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Management
            </h3>
            <NavLink 
              to="/admin/manage-bookings" 
              className={navLinkClass}
              onClick={handleLinkClick}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8h6m-6 0a2 2 0 01-2-2V9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2m-6 0V9" />
              </svg>
              <span>Manage Bookings</span>
            </NavLink>
            <NavLink 
              to="/admin/manage-users" 
              className={navLinkClass}
              onClick={handleLinkClick}
            >
              <User className="w-4 h-4" />
              <span>Manage Users</span>
            </NavLink>
          </div>

          {/* Analytics & Reports */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Analytics
            </h3>
            <NavLink 
              to="/admin/analytics" 
              className={navLinkClass}
              onClick={handleLinkClick}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Analytics</span>
            </NavLink>
            <NavLink 
              to="/admin/reports" 
              className={navLinkClass}
              onClick={handleLinkClick}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span>Reports</span>
            </NavLink>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <NavLink 
              to="/admin/settings" 
              className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded w-full block transition flex items-center space-x-2"
              onClick={handleLinkClick}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </NavLink>
            <NavLink 
              to="/" 
              className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded w-full block transition flex items-center space-x-2"
              onClick={handleLinkClick}
            >
              <Home className="w-4 h-4" />
              <span>Back to Site</span>
            </NavLink>
            <button
              onClick={() => {
                handleLogout();
                handleLinkClick();
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded w-full block transition flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminNavbar;