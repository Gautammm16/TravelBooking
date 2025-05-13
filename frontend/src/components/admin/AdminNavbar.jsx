import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminNavbar = () => {
  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-white bg-blue-600 px-4 py-2 rounded'
      : 'text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded transition';

  return (
    <nav className="bg-gray-100 p-4 shadow mb-6">
      <div className="max-w-7xl mx-auto flex space-x-4 flex-wrap">
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
      </div>
    </nav>
  );
};

export default AdminNavbar;
