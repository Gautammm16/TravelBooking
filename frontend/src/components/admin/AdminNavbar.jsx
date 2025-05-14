import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-white bg-blue-600 px-4 py-2 rounded w-full block'
      : 'text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded w-full block transition';

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-12 left-0 w-full flex items-start justify-start bg-transparent px-4 py-3 z-50">
        <button onClick={() => setIsOpen(true)} aria-label="Open Menu">
          <Menu className="w-6 h-6 text-blue-600" />
        </button>
      </div>

      {/* Sidebar for both mobile (drawer) and desktop */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-screen`}
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between md:hidden px-4 py-3 border-b">
          <h2 className="text-blue-600 text-lg font-medium">Menu</h2>
          <button onClick={() => setIsOpen(false)} aria-label="Close Menu">
            <X className="w-6 h-6 text-blue-600" />
          </button>
        </div>

        <nav className="flex flex-col space-y-2 p-4">
          <NavLink to="/admin/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/create-tour" className={navLinkClass}>
            Create Tour
          </NavLink>
          <NavLink to="/admin/manage-tours" className={navLinkClass}>
            Manage Tours
          </NavLink>
          <NavLink to="/admin/manage-bookings" className={navLinkClass}>
            Manage Bookings
          </NavLink>
          <NavLink to="/admin/manage-users" className={navLinkClass}>
            Manage Users
          </NavLink>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminNavbar;
